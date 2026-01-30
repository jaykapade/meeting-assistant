package services

import (
	"github.com/jaykapade/meeting-assistant/backend/internal/models"
	"github.com/jaykapade/meeting-assistant/backend/internal/storage"
	"gorm.io/gorm"
)

type MeetingService struct {
	DB    *gorm.DB
	Store storage.Provider
}

func NewMeetingService(db *gorm.DB, store storage.Provider) *MeetingService {
	return &MeetingService{DB: db, Store: store}
}

func (s *MeetingService) CreateMeeting(meeting *models.Meeting) (*models.Meeting, error) {
	err := s.DB.Create(meeting).Error
	if err != nil {
		return nil, err
	}
	return meeting, nil
}

func (s *MeetingService) GetMeeting(id uint) (*models.Meeting, error) {
	var meeting models.Meeting
	err := s.DB.First(&meeting, id).Error
	if err != nil {
		return nil, err
	}
	return &meeting, nil
}

func (s *MeetingService) GetAllMeetings() ([]models.Meeting, error) {
	var meetings []models.Meeting
	err := s.DB.Find(&meetings).Error
	if err != nil {
		return nil, err
	}
	return meetings, nil
}

func (s *MeetingService) UpdateMeeting(id uint, updates map[string]interface{}) (*models.Meeting, error) {
	var meeting models.Meeting

	// 1. Find the meeting first (to ensure it exists)
	if err := s.DB.First(&meeting, id).Error; err != nil {
		return nil, err
	}

	// 2. Apply updates using the MAP
	// GORM will now respect empty strings if they are in the map
	if err := s.DB.Model(&meeting).Updates(updates).Error; err != nil {
		return nil, err
	}

	return &meeting, nil
}

func (s *MeetingService) DeleteMeeting(id uint) error {
	err := s.DB.Delete(&models.Meeting{}, id).Error
	if err != nil {
		return err
	}
	return nil
}
