package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/jaykapade/meeting-assistant/backend/internal/handler"
)

func MeetingRoutes(router *gin.RouterGroup, meetingHandler *handler.MeetingHandler) {
	meetingsRouter := router.Group("/meetings")
	meetingsRouter.POST("/", meetingHandler.CreateMeeting)
}
