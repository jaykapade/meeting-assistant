package services

import (
	"github.com/jaykapade/meeting-assistant/backend/internal/models"
	"gorm.io/gorm"
)

type MeetingService struct {
	DB *gorm.DB
}

func NewMeetingService(db *gorm.DB) *MeetingService {
	return &MeetingService{DB: db}
}

func (s *MeetingService) CreateMeeting(meeting *models.Meeting) (*models.Meeting, error) {
	err := s.DB.Create(meeting).Error
	if err != nil {
		return nil, err
	}
	return meeting, nil
}
