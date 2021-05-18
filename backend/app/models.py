from sqlalchemy import Boolean, DateTime, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql.expression import null, true

from .database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True)
    firstname = Column(String)
    surname = Column(String)
    session_token = Column(String)
    is_admin = Column(Boolean)

    completed_challenges = relationship(
        "CompletedChallenges", backref="user", cascade="all, delete"
    )


class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    disabled = Column(Boolean, nullable=False)

    title = Column(String, index=True, nullable=False)
    description = Column(String, index=True, nullable=False)
    points = Column(Integer, nullable=False)
    flag = Column(String, nullable=False)
    tags = Column(String, nullable=False)
    category = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    education_links = Column(String, nullable=False)
    hint = Column(String, nullable=False)

    file_name = Column(String)
    file_hash = Column(String)

    challenge_url = Column(String)


class CompletedChallenges(Base):
    __tablename__ = "completed_challenges"

    challenge_id = Column(Integer, ForeignKey("challenges.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    time_completed = Column(Integer)
