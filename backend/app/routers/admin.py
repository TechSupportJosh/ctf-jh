from fastapi.exceptions import HTTPException
from app.settings import get_settings
from fastapi.datastructures import UploadFile
from starlette.responses import RedirectResponse
from app.middleware import Authenticated
from typing import Any, List, Optional
from fastapi import APIRouter
from fastapi.params import Depends, File, Form
from sqlalchemy.orm.session import Session
from app.depends import get_db
from app import schemas, models
import aiofiles
import hashlib
import os

router = APIRouter(
    prefix="/admin",
    tags=["Admin Related Endpoints"],
    dependencies=[Depends(Authenticated(True))],
)

settings = get_settings()


@router.get("/stats", response_model=schemas.Stats)
def get_stats(db: Session = Depends(get_db)):
    stats = {
        "user_count": db.query(models.User).count(),
        "total_completions": db.query(models.CompletedChallenges).count(),
    }

    return stats


@router.get("/challenges", response_model=List[schemas.ChallengeAdmin])
def get_all_challenges(db: Session = Depends(get_db)):
    return db.query(models.Challenge).all()


@router.post("/challenges_json", response_model=schemas.ChallengeAdmin)
def create_challenge_via_json(
    request: schemas.ChallengeCreate, db: Session = Depends(get_db)
):
    challenge = models.Challenge(**request.dict())
    db.add(challenge)
    db.commit()
    db.refresh(challenge)

    return challenge


@router.post("/challenges", response_model=schemas.ChallengeAdmin)
async def create_challenge(
    id: int = Form(-1),
    title: str = Form(...),
    description: str = Form(...),
    author: str = Form(...),
    flag: str = Form(...),
    category: str = Form(...),
    tags: str = Form(...),
    points: int = Form(...),
    difficulty: str = Form(...),
    hint: str = Form(...),
    disabled: bool = Form(False),
    education_links: str = Form(...),
    challenge_url: str = Form(""),
    challenge_file: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    if id == -1:
        challenge = models.Challenge(
            title=title,
            description=description,
            author=author,
            category=category,
            flag=flag,
            tags=tags,
            points=points,
            difficulty=difficulty,
            hint=hint,
            disabled=disabled,
            education_links=education_links,
            challenge_url=challenge_url,
        )

        db.add(challenge)
        db.commit()
    else:
        challenge = db.query(models.Challenge).get(id)

        # Lord forgive me for I have sinned
        challenge.title = title
        challenge.description = description
        challenge.author = author
        challenge.category = category
        challenge.flag = flag
        challenge.tags = tags
        challenge.points = points
        challenge.difficulty = difficulty
        challenge.hint = hint
        challenge.disabled = disabled
        challenge.education_links = education_links
        challenge.challenge_url = challenge_url

        # TODO: Delete old file question mark
        db.commit()

    if challenge_file is not None and challenge_file.filename:
        file_name = "IntakeCTF_{}.{}".format(
            challenge.id, challenge_file.filename.split(".")[-1]
        )

        async with aiofiles.open(
            os.path.join(os.getcwd(), "static", file_name), "wb"
        ) as out_file:
            content = await challenge_file.read()
            challenge.file_hash = hashlib.sha256(content).hexdigest()
            await out_file.write(content)

        challenge.file_name = file_name

    db.commit()

    return RedirectResponse(settings.admin_url, status_code=303)


@router.delete("/challenges/{challenge_id}", response_model={})
async def delete_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
):
    challenge = db.query(models.Challenge).get(challenge_id)

    if challenge is None:
        raise HTTPException(404)

    db.delete(challenge)
    db.commit()

    return {}


@router.delete("/challenges/{challenge_id}/submissions", response_model={})
async def delete_challenge_submissions(
    challenge_id: int,
    db: Session = Depends(get_db),
):
    challenge = db.query(models.Challenge).get(challenge_id)

    if challenge is None:
        raise HTTPException(404)

    for submission in (
        db.query(models.CompletedChallenges)
        .filter(models.CompletedChallenges.challenge_id == challenge_id)
        .all()
    ):
        db.delete(submission)

    db.commit()

    return {}
