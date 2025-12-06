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
