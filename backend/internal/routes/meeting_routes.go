package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/jaykapade/meeting-assistant/backend/internal/handler"
)

func MeetingRoutes(router *gin.RouterGroup, meetingHandler *handler.MeetingHandler) {
	meetingsRouter := router.Group("/meetings")
	meetingsRouter.POST("", meetingHandler.CreateMeeting)
	meetingsRouter.GET("/:id", meetingHandler.GetMeeting)
	meetingsRouter.GET("", meetingHandler.GetAllMeetings)
	meetingsRouter.PUT("/:id", meetingHandler.UpdateMeeting)
	meetingsRouter.DELETE("/:id", meetingHandler.DeleteMeeting)
}
