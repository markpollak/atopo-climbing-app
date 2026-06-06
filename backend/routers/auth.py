import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import bcrypt
from pydantic import BaseModel

from ..database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("JWT_SECRET", "atopo-dev-secret-change-in-production")
ALGORITHM = "HS256"
TOKEN_EXPIRE_DAYS = 30

bearer = HTTPBearer(auto_error=False)


# --- Schemas ---

class RegisterRequest(BaseModel):
    email: str
    name: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: str
    is_active: int
    subscription_tier: str
    last_login_at: Optional[str]
    created_at: str

class TokenResponse(BaseModel):
    token: str
    user: UserOut

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ResetPasswordRequest(BaseModel):
    new_password: str

class SetRoleRequest(BaseModel):
    role: str

class SetStatusRequest(BaseModel):
    is_active: bool

class SetTierRequest(BaseModel):
    subscription_tier: str


# --- Helpers ---

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": str(user_id), "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload["sub"])
    except JWTError:
        return None

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_id = decode_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="User not found")
    user = dict(row)
    if not user.get("is_active", 1):
        raise HTTPException(status_code=403, detail="Account deactivated")
    return user

def require_admin(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def _get_user_or_404(conn, user_id: int):
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return dict(row)


# --- Public routes ---

@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest):
    with get_db() as conn:
        if conn.execute("SELECT id FROM users WHERE email = ?", (body.email.lower(),)).fetchone():
            raise HTTPException(status_code=409, detail="Email already registered")
        cur = conn.execute(
            "INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)",
            (body.email.lower(), body.name.strip(), hash_password(body.password)),
        )
        row = conn.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()
    user = dict(row)
    return TokenResponse(token=create_token(user["id"]), user=UserOut(**user))


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (body.email.lower(),)).fetchone()
        if not row or not verify_password(body.password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        if not row["is_active"]:
            raise HTTPException(status_code=403, detail="Account deactivated")
        conn.execute("UPDATE users SET last_login_at = datetime('now') WHERE id = ?", (row["id"],))
        updated = conn.execute("SELECT * FROM users WHERE id = ?", (row["id"],)).fetchone()
    user = dict(updated)
    return TokenResponse(token=create_token(user["id"]), user=UserOut(**user))


@router.get("/me", response_model=UserOut)
def me(user=Depends(get_current_user)):
    return UserOut(**user)


@router.post("/change-password", status_code=204)
def change_password(body: ChangePasswordRequest, user=Depends(get_current_user)):
    if len(body.new_password) < 8:
        raise HTTPException(status_code=422, detail="New password must be at least 8 characters")
    if not verify_password(body.current_password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    with get_db() as conn:
        conn.execute("UPDATE users SET password_hash = ? WHERE id = ?",
                     (hash_password(body.new_password), user["id"]))


# --- Admin routes ---

@router.get("/admin/stats")
def admin_stats(admin=Depends(require_admin)):
    with get_db() as conn:
        total_users   = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        active_users  = conn.execute("SELECT COUNT(*) FROM users WHERE is_active = 1").fetchone()[0]
        new_this_week = conn.execute(
            "SELECT COUNT(*) FROM users WHERE created_at >= datetime('now', '-7 days')"
        ).fetchone()[0]
        new_this_month = conn.execute(
            "SELECT COUNT(*) FROM users WHERE created_at >= datetime('now', '-30 days')"
        ).fetchone()[0]
        total_crags   = conn.execute("SELECT COUNT(*) FROM crags").fetchone()[0]
        total_routes  = conn.execute("SELECT COUNT(*) FROM routes").fetchone()[0]
        tier_counts   = dict(conn.execute(
            "SELECT subscription_tier, COUNT(*) FROM users GROUP BY subscription_tier"
        ).fetchall())
    return {
        "total_users": total_users,
        "active_users": active_users,
        "new_this_week": new_this_week,
        "new_this_month": new_this_month,
        "total_crags": total_crags,
        "total_routes": total_routes,
        "tier_counts": tier_counts,
    }


@router.get("/admin/users", response_model=list[UserOut])
def list_users(admin=Depends(require_admin)):
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM users ORDER BY created_at DESC").fetchall()
    return [UserOut(**dict(r)) for r in rows]


@router.patch("/admin/users/{user_id}/role", response_model=UserOut)
def set_role(user_id: int, body: SetRoleRequest, admin=Depends(require_admin)):
    if body.role not in ("user", "admin"):
        raise HTTPException(status_code=422, detail="Role must be 'user' or 'admin'")
    with get_db() as conn:
        _get_user_or_404(conn, user_id)
        conn.execute("UPDATE users SET role = ? WHERE id = ?", (body.role, user_id))
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return UserOut(**dict(row))


@router.patch("/admin/users/{user_id}/status", response_model=UserOut)
def set_status(user_id: int, body: SetStatusRequest, admin=Depends(require_admin)):
    if user_id == admin["id"] and not body.is_active:
        raise HTTPException(status_code=422, detail="Cannot deactivate your own account")
    with get_db() as conn:
        _get_user_or_404(conn, user_id)
        conn.execute("UPDATE users SET is_active = ? WHERE id = ?", (1 if body.is_active else 0, user_id))
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return UserOut(**dict(row))


@router.patch("/admin/users/{user_id}/tier", response_model=UserOut)
def set_tier(user_id: int, body: SetTierRequest, admin=Depends(require_admin)):
    valid = {"free", "pro", "expired"}
    if body.subscription_tier not in valid:
        raise HTTPException(status_code=422, detail=f"Tier must be one of {valid}")
    with get_db() as conn:
        _get_user_or_404(conn, user_id)
        conn.execute("UPDATE users SET subscription_tier = ? WHERE id = ?", (body.subscription_tier, user_id))
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return UserOut(**dict(row))


@router.post("/admin/users/{user_id}/reset-password", status_code=204)
def admin_reset_password(user_id: int, body: ResetPasswordRequest, admin=Depends(require_admin)):
    if len(body.new_password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")
    with get_db() as conn:
        _get_user_or_404(conn, user_id)
        conn.execute("UPDATE users SET password_hash = ? WHERE id = ?",
                     (hash_password(body.new_password), user_id))


@router.delete("/admin/users/{user_id}", status_code=204)
def delete_user(user_id: int, admin=Depends(require_admin)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=422, detail="Cannot delete your own account")
    with get_db() as conn:
        _get_user_or_404(conn, user_id)
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
