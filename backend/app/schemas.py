from typing import Any, List, Optional, Union

from pydantic import BaseModel, validator
from datetime import datetime, timezone


class ChallengeBase(BaseModel):
    id: int
    title: str
    author: str
    points: str
    category: str
    difficulty: str
    unlock_requirement: int

    @validator("unlock_requirement", pre=True)
    def convert_none_to_int(cls, value):
        if value is None:
            return -1
        else:
            return value

    class Config:
        orm_mode = True


class LockedChallenge(ChallengeBase):
    locked: bool = True


class UnlockedChallenge(ChallengeBase):
    locked: bool = False
    description: str
    hint: str
    tags: List[str]
    education_resources: List[str]
    url: Optional[str]
    file_name: Optional[str]
    file_hash: Optional[str]

    @validator("tags", pre=True)
    def split_tags(cls, value):
        return value.split(",")

    @validator("education_resources", pre=True)
    def split_links(cls, value):
        return value.split(",")


Challenge = Union[UnlockedChallenge, LockedChallenge]


class UserChallengeCompletion(BaseModel):
    time_completed: int
    challenge_id: int

    class Config:
        orm_mode = True


class AdminChallengeCompletion(UserChallengeCompletion):
    user_id: int


class AdminChallenge(UnlockedChallenge):
    flag: str
    disabled: bool
    completions: List[AdminChallengeCompletion]


class SubmitChallenge(BaseModel):
    challenge_id: int
    flag: str


class User(BaseModel):
    firstname: str
    surname: str
    is_admin: bool

    completed_challenges: List[UserChallengeCompletion]

    class Config:
        orm_mode = True


class Stats(BaseModel):
    user_count: int
    total_completions: int
