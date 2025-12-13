from sqlalchemy.orm import Session
from sqlalchemy import update
from models.meeting import Meeting, MeetingStatus


def update_meeting_status(
    db: Session,
    meeting_id: int,
    status: MeetingStatus,
    **fields

):
    stmt = (
        update(Meeting)
        .where(Meeting.id == meeting_id)
        .values(
            status=status,
            **fields
        )
    )
    db.execute(stmt)
    db.commit()


def save_results(
    db: Session,
    meeting_id: int,
    transcript: str | None,
    summary: str | None,
    action_items: list | None,
    key_points: list | None = None,
):
    stmt = (
        update(Meeting)
        .where(Meeting.id == meeting_id)
        .values(
            transcript=transcript,
            summary=summary,
            action_items=action_items,
            key_points=key_points,
            status=MeetingStatus.completed,
        )
    )

    result = db.execute(stmt)
    if result.rowcount == 0:
        raise ValueError(f"Meeting {meeting_id} not found")
    db.commit()


def mark_failed(db: Session, meeting_id: int):
    stmt = (
        update(Meeting)
        .where(Meeting.id == meeting_id)
        .values(
            status=MeetingStatus.failed,
        )
    )
    db.execute(stmt)
    db.commit()
