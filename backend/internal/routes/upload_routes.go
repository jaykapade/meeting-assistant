package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/jaykapade/meeting-assistant/backend/internal/handler"
)

func UploadRoutes(router *gin.RouterGroup, uploadHandler *handler.UploadHandler) {
	uploadRouter := router.Group("/upload")
	uploadRouter.POST("", uploadHandler.UploadFile)
}
