from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    BigInteger,
    Enum,
    ForeignKey,
    func,
    text
)
from sqlalchemy.dialects.postgresql import JSONB
from db.session import Base
import enum


class MeetingStatus(str, enum.Enum):
    created = "created"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)

    # Basic Info
    title = Column(String(255), nullable=False)
    description = Column(Text)

    # Meeting Details
    meeting_url = Column(String(500))
    meeting_platform = Column(String(50))
    scheduled_at = Column(DateTime(timezone=True))

    # Recording Details
    recording_path = Column(String(500))
    recording_size_bytes = Column(BigInteger)
    recording_duration_seconds = Column(Integer)

    # AI Results
    transcript = Column(Text)
    summary = Column(Text)

    # JSONB Fields
    key_points = Column(JSONB)
    action_items = Column(JSONB)

    # Status
    status = Column(
        Enum(MeetingStatus, name="meeting_status"),
        nullable=False,
        server_default=text("'created'::meeting_status"),
        index=True
    )

    # Nullable user
    user_id = Column(Integer)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
