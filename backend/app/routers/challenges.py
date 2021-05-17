from app.middleware import Authenticated
from typing import List
from fastapi import APIRouter
from fastapi.params import Depends
from sqlalchemy.orm.session import Session
from app.depends import get_db
from app import schemas, models

router = APIRouter(
    prefix="/challenges",
    tags=["Challenge Related Endpoints"],
    dependencies=[Depends(Authenticated())]
)

@router.get("/", response_model=List[schemas.Challenge])
def get_all_challenges(db: Session = Depends(get_db)):
    return db.query(models.Challenge).all()
