package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/jaykapade/meeting-assistant/backend/internal/handler"
)

type RouteConfig struct {
	MeetingHandler *handler.MeetingHandler
	UploadHandler  *handler.UploadHandler
}

func RegisterRoutes(router *gin.Engine, cfg *RouteConfig) {
	api := router.Group("/api/v1")

	api.GET("/hello", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello, World!",
		})
	})

	MeetingRoutes(api, cfg.MeetingHandler)
	UploadRoutes(api, cfg.UploadHandler)

}
