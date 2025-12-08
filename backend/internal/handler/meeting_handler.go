package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jaykapade/meeting-assistant/backend/internal/models"
	"github.com/jaykapade/meeting-assistant/backend/internal/services"
	"gorm.io/gorm"
)

type CreateMeetingRequest struct {
	Title       string  `json:"title" binding:"required"`
	Description string  `json:"description"`
	MeetingURL  *string `json:"meeting_url"` // Pointer allows null
	// Recording Details
	RecordingPath            *string `json:"recording_path"`
	RecordingDurationSeconds *int    `json:"recording_duration_seconds"`
	RecordingSizeBytes       *int64  `json:"recording_size_bytes"`
}

type UpdateMeetingRequest struct {
	Title       *string `json:"title" binding:"omitempty,min=3"`
	Description *string `json:"description"`
	MeetingURL  *string `json:"meeting_url"`
	// Recording Details
	RecordingPath            *string `json:"recording_path"`
	RecordingDurationSeconds *int    `json:"recording_duration_seconds"`
	RecordingSizeBytes       *int64  `json:"recording_size_bytes"`
	Status                   *string `json:"status" binding:"omitempty,oneof=created processing completed failed"`
}

type MeetingHandler struct {
	MeetingService *services.MeetingService
}

func NewMeetingHandler(meetingService *services.MeetingService) *MeetingHandler {
	return &MeetingHandler{MeetingService: meetingService}
}

func (h *MeetingHandler) CreateMeeting(c *gin.Context) {
	var req CreateMeetingRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	meeting := models.Meeting{
		Title:                    req.Title,
		Description:              req.Description,
		MeetingURL:               req.MeetingURL,
		RecordingPath:            req.RecordingPath,
		RecordingDurationSeconds: req.RecordingDurationSeconds,
		RecordingSizeBytes:       req.RecordingSizeBytes,
	}

	createdMeeting, err := h.MeetingService.CreateMeeting(&meeting)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, createdMeeting)
}

func (h *MeetingHandler) GetMeeting(c *gin.Context) {
	meetingId := c.Param("id")
	id, err := strconv.ParseUint(meetingId, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	meeting, err := h.MeetingService.GetMeeting(uint(id))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Meeting not found"})
			return
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}
	c.JSON(http.StatusOK, meeting)
}

// TODO: Add pagination
func (h *MeetingHandler) GetAllMeetings(c *gin.Context) {
	meetings, err := h.MeetingService.GetAllMeetings()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, meetings)
}

func (h *MeetingHandler) UpdateMeeting(c *gin.Context) {
	meetingId := c.Param("id")
	id, err := strconv.ParseUint(meetingId, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	var req UpdateMeetingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// CREATE A MAP, NOT A STRUCT
	updates := make(map[string]interface{})

	if req.Title != nil {
		updates["title"] = *req.Title
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.MeetingURL != nil {
		updates["meeting_url"] = *req.MeetingURL
	}
	if req.RecordingPath != nil {
		updates["recording_path"] = *req.RecordingPath
	}
	if req.RecordingDurationSeconds != nil {
		updates["recording_duration_seconds"] = *req.RecordingDurationSeconds
	}
	if req.RecordingSizeBytes != nil {
		updates["recording_size_bytes"] = *req.RecordingSizeBytes
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}

	meeting, err := h.MeetingService.UpdateMeeting(uint(id), updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, meeting)
}

func (h *MeetingHandler) DeleteMeeting(c *gin.Context) {
	meetingId := c.Param("id")
	id, err := strconv.ParseUint(meetingId, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	err = h.MeetingService.DeleteMeeting(uint(id))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Meeting not found"})
			return
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}
	c.JSON(http.StatusOK, gin.H{"message": "Meeting deleted successfully"})
}
