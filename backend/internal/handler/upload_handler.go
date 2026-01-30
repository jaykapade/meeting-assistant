package handler

import (
	"context"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jaykapade/meeting-assistant/backend/internal/storage"
)

type UploadHandler struct {
	Store   storage.Provider
	MaxSize int64
}

func NewUploadHandler(store storage.Provider) *UploadHandler {
	return &UploadHandler{
		Store:   store,
		MaxSize: 50 << 20, // 50 MB
	}
}

func (h *UploadHandler) UploadFile(c *gin.Context) {
	// 1. Get the file from the request
	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	// 2. Validate the file size
	if fileHeader.Size > h.MaxSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size exceeds 50MB"})
		return
	}

	// 3. Validate the file extension
	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if ext != ".mp3" && ext != ".wav" && ext != ".m4a" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only .mp3, .wav, and .m4a files are allowed"})
		return
	}

	fileStream, err := fileHeader.Open()
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to open file stream"})
		return
	}
	defer fileStream.Close()

	// 4. Generate a unique filename
	key := uuid.New().String() + ext

	// 5. Upload the file to the storage provider with timeout
	// Use 5 minutes to allow for large file uploads (up to 50MB)
	uploadCtx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Minute)
	defer cancel()

	result, err := h.Store.Upload(uploadCtx, fileStream, key, fileHeader.Header.Get("Content-Type"))
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to upload to storage", "details": err.Error()})
		return
	}

	// 6. Return the success response
	c.JSON(200, gin.H{"message": "File uploaded successfully", "file_id": result.Key, "filename": fileHeader.Filename})

}

func (h *UploadHandler) DownloadFile(c *gin.Context) {
	fileId := c.Param("file_id") // This is the 'Key' (e.g. uuid.mp3)

	// 1. Get the signed URL
	// We use a short timeout (5s) because generating a string is fast
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	url, err := h.Store.GetSignedURL(ctx, fileId)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to generate download link"})
		return
	}

	// 2. Return it
	c.JSON(200, gin.H{
		"file_id":      fileId,
		"download_url": url,
		"expires_in":   "15m",
	})
}
