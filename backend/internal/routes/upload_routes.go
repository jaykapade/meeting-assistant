package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/jaykapade/meeting-assistant/backend/internal/handler"
)

func UploadRoutes(router *gin.RouterGroup, uploadHandler *handler.UploadHandler) {
	uploadRouter := router.Group("/file")
	uploadRouter.POST("/upload", uploadHandler.UploadFile)
	uploadRouter.GET("/download/:file_id", uploadHandler.DownloadFile)
}
