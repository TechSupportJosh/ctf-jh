from typing import Any, List, Optional

from pydantic import BaseModel
from datetime import datetime, timezone


class ChallengeBase(BaseModel):
    title: str
    description: str
    points: int

    class Config:
        orm_mode = True


class ChallengeCreate(ChallengeBase):
    flag: str


class Challenge(ChallengeBase):
    id: int


class ChallengeAdmin(Challenge):
    flag: str


class SubmitChallenge(BaseModel):
    challenge_id: int
    flag: str


class CompletedChallenge(BaseModel):
    time_completed: int
    challenge_id: int

    class Config:
        orm_mode = True


class User(BaseModel):
    firstname: str
    surname: str
    is_admin: bool

    completed_challenges: List[CompletedChallenge]

    class Config:
        orm_mode = True
