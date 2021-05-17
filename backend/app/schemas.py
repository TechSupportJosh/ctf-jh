from typing import List, Optional

from pydantic import BaseModel


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