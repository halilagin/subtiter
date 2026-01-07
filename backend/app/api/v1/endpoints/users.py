from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ....db.database import get_db
from ....core.security import get_password_hash
from ....core.auth import get_current_active_user
from ....db.model_document import User
from ....schemas.schema_user import MessageResponse, UserCreate, User as UserSchema, UserDelete
from app.schemas import schema_user

router = APIRouter()


@router.post("/users/", response_model=schema_user.MessageResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        db_user = User(
            email=user.email,
            username=user.username,
            hashed_password=get_password_hash(user.password)
        )
        db.add(db_user)
        db.commit()
        return schema_user.MessageResponse(message="User created successfully")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))



@router.get("/users/me/", response_model=UserSchema)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.get("/users/", response_model=List[UserSchema])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.post("/users/delete", response_model=MessageResponse)
async def delete_user(user: UserDelete, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}
