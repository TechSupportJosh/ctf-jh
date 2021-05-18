from typing import Any, List, Optional

from pydantic import BaseModel, validator
from datetime import datetime, timezone


class ChallengeBase(BaseModel):
    title: str
    description: str
    points: int
    category: str
    difficulty: str
    hint: str
    challenge_url: Optional[str]
    file_name: Optional[str]
    file_hash: Optional[str]

    class Config:
        orm_mode = True


class ChallengeCreate(ChallengeBase):
    flag: str
    tags: str
    education_links: str


class Challenge(ChallengeBase):
    id: int
    tags: List[str]
    education_links: List[str]

    @validator("tags", pre=True)
    def split_tags(cls, value):
        return value.split(",")

    @validator("education_links", pre=True)
    def split_links(cls, value):
        return value.split(",")


class ChallengeAdmin(Challenge):
    flag: str
    disabled: bool


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
