package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/jaykapade/meeting-assistant/backend/internal/handler"
)

type RouteConfig struct {
	MeetingHandler *handler.MeetingHandler
}

func RegisterRoutes(router *gin.Engine, cfg *RouteConfig) {
	api := router.Group("/api/v1")

	router.GET("/hello", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello, World!",
		})
	})

	MeetingRoutes(api, cfg.MeetingHandler)

}
