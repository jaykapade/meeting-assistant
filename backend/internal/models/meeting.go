package meeting

import (
	"time"

	"gorm.io/datatypes"
)

type MeetingStatus string

const (
	StatusCreated    MeetingStatus = "created"
	StatusProcessing MeetingStatus = "processing"
	StatusCompleted  MeetingStatus = "completed"
	StatusFailed     MeetingStatus = "failed"
)

type Meeting struct {
	ID uint `gorm:"primaryKey;autoIncrement" json:"id"`
	// Basic Info
	Title       string `gorm:"not null" json:"title"`
	Description string `json:"description"`
	// Meeting Details
	MeetingURL      string     `json:"meeting_url"`
	MeetingPlatform string     `json:"meeting_platform"`
	ScheduledAt     *time.Time `json:"scheduled_at"`
	// Recording Details
	RecordingPath            *string `json:"recording_path"`
	RecordingSizeBytes       int64   `json:"recording_size_bytes"`
	RecordingDurationSeconds int     `json:"recording_duration_seconds"`

	// 5. AI Results (Text is fine for now)
	Transcript *string `gorm:"type:text" json:"transcript"`
	Summary    *string `gorm:"type:text" json:"summary"`

	KeyPoints   datatypes.JSON `gorm:"type:jsonb" json:"key_points"`
	ActionItems datatypes.JSON `gorm:"type:jsonb" json:"action_items"`

	Status MeetingStatus `gorm:"default:created;index" json:"status"`
	// Nullable User ID for now
	UserID *uint `gorm:"index" json:"user_id"`

	// Timestamps
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
