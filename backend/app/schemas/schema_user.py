from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from pydantic import ConfigDict
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )

class UserDelete(BaseModel):
    email: str
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )

class UserCreate(UserBase):
    password: str
    model_config = ConfigDict(from_attributes=True)

class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str
    subscription_plan: str
    model_config = ConfigDict(from_attributes=True)

class UserConfirmSignup(BaseModel):
    email: EmailStr
    confirmation_code: str
    model_config = ConfigDict(from_attributes=True)

class UserRegisterAndConfirm(BaseModel):
    """Combined registration and confirmation in one request"""
    email: EmailStr
    name: str
    password: str
    confirmation_code: Optional[str] = None  # Optional: if provided, will auto-confirm
    model_config = ConfigDict(from_attributes=True)

class RoleBase(BaseModel):
    name: str

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )

class RoleCreate(RoleBase):
    pass
    model_config = ConfigDict(from_attributes=True)

class Role(RoleBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class GroupBase(BaseModel):
    name: str
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )

class GroupCreate(GroupBase):
    pass
    model_config = ConfigDict(from_attributes=True)
class Group(GroupBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class User(UserBase):
    id: str
    is_active: bool = True
    is_superuser: bool = False
    name: Optional[str]

    subscription_expires_at: Optional[datetime] = None
    subscription_status: Optional[str] = None
    subscription_created_at: Optional[datetime] = None
    subscription_updated_at: Optional[datetime] = None
    subscription_plan: Optional[str] = None  # PAY_AS_YOU_GO, MONTHLY_PAYMENT, VOLUME_BASED_PAYMENT
    subscription_id: Optional[str] = None
    roles: List[Role] = []
    groups: List[Group] = []

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: Optional[str] = None
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )

class TokenData(BaseModel):
    username: Optional[str] = None
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )


class MessageResponse(BaseModel):
    message: Any
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )