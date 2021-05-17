from fastapi.exceptions import HTTPException
from sqlalchemy.sql.expression import and_
from starlette.requests import HTTPConnection
from app.middleware import Authenticated, GetUser
from typing import List
from fastapi import APIRouter
from fastapi.params import Depends
from sqlalchemy.orm.session import Session
from app.depends import get_db
from app import schemas, models

router = APIRouter(
    prefix="/me",
    tags=["Me Related Endpoints"],
    dependencies=[Depends(Authenticated())],
)


@router.get("/", response_model=schemas.User)
def get_me(user: models.User = Depends(GetUser())):
    return user
