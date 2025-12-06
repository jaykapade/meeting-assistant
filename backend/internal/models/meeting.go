package models

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
	Title       string `gorm:"type:varchar(255);not null" json:"title"`
	Description string `gorm:"type:text" json:"description"`

	// Meeting Details: Using *string allows these to be NULL in DB if empty
	MeetingURL      *string    `gorm:"type:varchar(500)" json:"meeting_url"`
	MeetingPlatform *string    `gorm:"type:varchar(50)" json:"meeting_platform"`
	ScheduledAt     *time.Time `json:"scheduled_at"`

	// Recording Details
	RecordingPath            *string `gorm:"type:varchar(500)" json:"recording_path"`
	RecordingSizeBytes       *int64  `json:"recording_size_bytes"`
	RecordingDurationSeconds *int    `json:"recording_duration_seconds"`

	// AI Results: Text is fine for now. If transcripts get >10MB, we move to S3.
	Transcript *string `gorm:"type:text" json:"transcript"`
	Summary    *string `gorm:"type:text" json:"summary"`

	// JSONB Fields
	KeyPoints   datatypes.JSON `gorm:"type:jsonb" json:"key_points"`
	ActionItems datatypes.JSON `gorm:"type:jsonb" json:"action_items"`

	// Status details
	Status MeetingStatus `gorm:"type:varchar(50);default:'created';index" json:"status"`

	// Nullable User ID for now
	UserID *uint `gorm:"index" json:"user_id"`

	// Timestamps
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
