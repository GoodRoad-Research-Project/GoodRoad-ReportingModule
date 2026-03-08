# GoodRoad/backend/app/models.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime


class Driver(Base):
    """
    Driver/Vehicle Owner table
    Stores registered vehicle and owner information
    """
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    plate_no = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    vehicle_type = Column(String(50), nullable=False)
    registered_at = Column(DateTime, default=datetime.now, nullable=False)
    contributor_level = Column(String(50), default="Bronze")
    upload_count = Column(Integer, default=0)

    # Relationships
    violations = relationship("Violation", back_populates="driver", cascade="all, delete-orphan")
    rewards = relationship("Reward", back_populates="driver", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Driver(plate_no='{self.plate_no}', name='{self.name}')>"


class Violation(Base):
    """
    Violations table
    Stores traffic violation records for each vehicle
    """
    __tablename__ = "violations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    plate_no = Column(String(20), ForeignKey("drivers.plate_no", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False, index=True)  # Violation code (e.g., RED_LIGHT)
    label = Column(String(255), nullable=False)  # Human-readable label
    weight = Column(Float, nullable=False)  # Base penalty weight
    multiplier = Column(Float, default=1.0)  # Repeat offense multiplier
    points = Column(Float, nullable=False)  # Final calculated points
    timestamp = Column(DateTime, default=datetime.now, nullable=False, index=True)
    expiry_date = Column(DateTime, nullable=False, index=True)
    generated_email = Column(Text, nullable=True)  # AI-generated email content

    # Relationships
    driver = relationship("Driver", back_populates="violations")

    def __repr__(self):
        return f"<Violation(plate_no='{self.plate_no}', type='{self.type}', points={self.points})>"


class Reward(Base):
    """
    Rewards table
    Stores dashcam footage submission rewards for community contributors
    """
    __tablename__ = "rewards"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    plate_no = Column(String(20), ForeignKey("drivers.plate_no", ondelete="CASCADE"), nullable=False, index=True)
    violation_reported = Column(String(255), nullable=False)  # Type of violation reported
    amount = Column(Float, nullable=False)  # Reward amount in LKR
    timestamp = Column(DateTime, default=datetime.now, nullable=False, index=True)
    footage_url = Column(String(500), nullable=True)  # Optional: URL to uploaded footage
    status = Column(String(50), default="pending")  # pending, approved, rejected

    # Relationships
    driver = relationship("Driver", back_populates="rewards")

    def __repr__(self):
        return f"<Reward(plate_no='{self.plate_no}', amount={self.amount}, status='{self.status}')>"
