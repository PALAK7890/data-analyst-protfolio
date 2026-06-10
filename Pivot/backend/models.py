"""
SQLAlchemy ORM Models for PatternPilot AI
"""
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, DateTime, Date, Text
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    pattern = Column(String(100), nullable=True)
    difficulty = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, nullable=True)
    language = Column(String(50), nullable=False)
    code = Column(Text, nullable=False)
    status = Column(String(50), nullable=True)
    rating = Column(Float, nullable=True)
    time_complexity = Column(String(100), nullable=True)
    space_complexity = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Mistake(Base):
    __tablename__ = "mistakes"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, nullable=True)
    mistake_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class PatternProgress(Base):
    __tablename__ = "pattern_progress"

    id = Column(Integer, primary_key=True, index=True)
    pattern_name = Column(String(100), unique=True, nullable=False)
    attempts = Column(Integer, default=0)
    solved = Column(Integer, default=0)
    hints_used = Column(Integer, default=0)
    average_rating = Column(Float, default=0.0)
    strength_score = Column(Float, default=0.0)  # 0-100
    last_practiced = Column(DateTime, nullable=True)


class RevisionSchedule(Base):
    __tablename__ = "revision_schedule"

    id = Column(Integer, primary_key=True, index=True)
    pattern_name = Column(String(100), nullable=False)
    review_date = Column(Date, nullable=False)
    status = Column(String(50), default="pending")  # pending | done
