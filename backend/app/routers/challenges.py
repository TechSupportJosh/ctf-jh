from fastapi.exceptions import HTTPException
from sqlalchemy.sql.expression import and_
from fastapi import Request
from sqlalchemy.sql.functions import char_length
from starlette.requests import HTTPConnection
from app.middleware import Authenticated, GetUser
from typing import List, Union
from fastapi import APIRouter
from fastapi.params import Depends
from sqlalchemy.orm.session import Session
from app.depends import get_db
from app import schemas, models
from app.main import limiter
import datetime

router = APIRouter(
    prefix="/challenges",
    tags=["Challenge Related Endpoints"],
    dependencies=[Depends(Authenticated())],
)


@router.get("/", response_model=List[schemas.Challenge])
def get_all_challenges(
    db: Session = Depends(get_db), user: models.User = Depends(GetUser())
):
    challenges = []

    for challenge in (
        db.query(models.Challenge).filter(models.Challenge.disabled == False).all()
    ):
        if challenge.unlock_requirement is None:
            challenges.append(challenge)
        else:
            completed_entry = list(
                filter(
                    lambda entry: entry.challenge_id == challenge.unlock_requirement,
                    user.completed_challenges,
                )
            )
            # Check whether they've completed the unlock requirement
            if len(completed_entry):
                # If they have, add the full challenge
                challenges.append(challenge)
            else:
                # Otherwise, append a "censored version"
                challenges.append(schemas.LockedChallenge(**challenge.__dict__))

    return challenges


@router.post("/submit", response_model={})
@limiter.limit("5/minute")
def submit_challenge(
    request: Request,
    submission: schemas.SubmitChallenge,
    db: Session = Depends(get_db),
    user: models.User = Depends(GetUser()),
):
    challenge = db.query(models.Challenge).get(submission.challenge_id)

    if challenge is None or challenge.disabled:
        raise HTTPException(404)

    completed_challenge_entry = (
        db.query(models.CompletedChallenges)
        .filter(
            and_(
                models.CompletedChallenges.challenge_id == submission.challenge_id,
                models.CompletedChallenges.user_id == user.user_id,
            )
        )
        .first()
    )

    if completed_challenge_entry is not None:
        raise HTTPException(400, "Challenge has already been completed.")

    if challenge.flag != submission.flag:
        raise HTTPException(400, "Incorrect flag.")

    db.add(
        models.CompletedChallenges(
            user_id=user.user_id,
            challenge_id=submission.challenge_id,
            time_completed=int(
                datetime.datetime.now(tz=datetime.timezone.utc).timestamp()
            ),
        )
    )
    db.commit()

    return {}
