from fastapi import Request
from fastapi.exceptions import HTTPException
from fastapi.params import Depends
from sqlalchemy.orm.session import Session
from app.depends import get_db
from app import models

class Authenticated:
    def __init__(self, admin_only=False):
        self.admin_only = admin_only

    def __call__(self, request: Request, db = Depends(get_db)):
        auth_cookie = request.cookies.get("auth", None)

        if auth_cookie is None:
            raise HTTPException(status_code=403)
        
        db_user = db.query(models.User).filter(models.User.session_token == auth_cookie).first()

        if db_user is None:
            raise HTTPException(status_code=403)

        if self.admin_only and not db_user.is_admin:
            raise HTTPException(status_code=403)
