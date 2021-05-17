from sqlalchemy import Boolean, DateTime, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql.expression import true

from .database import Base


class User(Base):
    __tablename__ = "users"

    warwick_id = Column(Integer, primary_key=True)
    firstname = Column(String)
    surname = Column(String)
    session_token = Column(String)
    sensor_units = relationship("CompletedChallenges", backref="user", cascade="all, delete")
    is_admin = Column(Boolean)


class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, index=True)
    points = Column(Integer)
    flag = Column(String)


class CompletedChallenges(Base):
    __tablename__ = "completed_challenges"

    challenge_id = Column(Integer, ForeignKey("challenges.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.warwick_id"), primary_key=True)
    time_completed = Column(DateTime)