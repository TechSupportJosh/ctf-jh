from app.middleware import Authenticated
from typing import List
from fastapi import APIRouter
from fastapi.params import Depends
from sqlalchemy.orm.session import Session
from app.depends import get_db
from app import schemas, models

router = APIRouter(
    prefix="/admin",
    tags=["Admin Related Endpoints"],
    dependencies=[Depends(Authenticated(True))]
)


@router.get("/challenges", response_model=List[schemas.ChallengeAdmin])
def get_all_challenges(db: Session = Depends(get_db)):
    return db.query(models.Challenge).all()

@router.post("/challenges", response_model=schemas.ChallengeAdmin)
def create_challenge(request: schemas.ChallengeCreate, db: Session = Depends(get_db)):
    challenge = models.Challenge(**request.dict())
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    
    return challenge