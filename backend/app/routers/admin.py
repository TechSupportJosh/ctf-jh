from app.settings import get_settings
from fastapi.datastructures import UploadFile
from starlette.responses import RedirectResponse
from app.middleware import Authenticated
from typing import List, Optional
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
    flag: str = Form(...),
    category: str = Form(...),
    tags: str = Form(...),
    points: int = Form(...),
    difficulty: str = Form(...),
    challenge_url: str = Form(""),
    challenge_file: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    if id == -1:
        challenge = models.Challenge(
            title=title,
            description=description,
            category=category,
            flag=flag,
            tags=tags,
            points=points,
            difficulty=difficulty,
            challenge_url=challenge_url,
        )

        db.add(challenge)
        db.commit()
    else:
        challenge = db.query(models.Challenge).get(id)

        # Lord forgive me for I have sinned
        challenge.title = title
        challenge.description = description
        challenge.category = category
        challenge.flag = flag
        challenge.tags = tags
        challenge.points = points
        challenge.difficulty = difficulty
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
