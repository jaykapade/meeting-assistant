package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jaykapade/meeting-assistant/backend/internal/models"
	"github.com/jaykapade/meeting-assistant/backend/internal/services"
)

type CreateMeetingRequest struct {
	Title       string  `json:"title" binding:"required"`
	Description string  `json:"description"`
	MeetingURL  *string `json:"meeting_url"` // Pointer allows null
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
		Title:       req.Title,
		Description: req.Description,
		MeetingURL:  req.MeetingURL,
	}

	createdMeeting, err := h.MeetingService.CreateMeeting(&meeting)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, createdMeeting)
}
