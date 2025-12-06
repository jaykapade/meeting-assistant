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

func (s *MeetingService) UpdateMeeting(id uint, meeting *models.Meeting) (*models.Meeting, error) {
	err := s.DB.Model(&models.Meeting{}).Where("id = ?", id).Updates(meeting).Error
	if err != nil {
		return nil, err
	}
	return meeting, nil
}

func (s *MeetingService) DeleteMeeting(id uint) error {
	err := s.DB.Delete(&models.Meeting{}, id).Error
	if err != nil {
		return err
	}
	return nil
}
