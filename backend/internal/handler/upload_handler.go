package handler

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UploadHandler struct {
	UploadDir string
	MaxSize   int64
}

func NewUploadHandler() *UploadHandler {
	uploadDir := "uploads"

	// Create the uploads directory if it doesn't exist
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		log.Fatalf("Failed to create uploads directory: %v", err)
	}

	return &UploadHandler{
		UploadDir: uploadDir,
		MaxSize:   50 << 20,
	}
}

func (h *UploadHandler) UploadFile(c *gin.Context) {
	// 1. Get the file from the request
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	// 2. Validate the file size
	if file.Size > h.MaxSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size exceeds 50MB"})
		return
	}

	// 3. Validate the file extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".mp3" && ext != ".wav" && ext != ".m4a" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only .mp3, .wav, and .m4a files are allowed"})
		return
	}

	// 4. Generate a unique filename
	filename := uuid.New().String() + ext

	// 5. Create the file path
	filePath := filepath.Join(h.UploadDir, filename)

	// 6. Save the file to the server
	err = c.SaveUploadedFile(file, filePath)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// 7. Return the success response
	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully", "file_id": filename, "filename": file.Filename})
}

func (h *UploadHandler) DownloadFile(c *gin.Context) {
	fileId := c.Param("file_id")

	// 1. Security Sanity Check
	// Prevent directory traversal attacks (e.g. "../../../etc/passwd")
	// TODO: Add a more robust security check
	if strings.Contains(fileId, "..") || strings.Contains(fileId, "/") || strings.Contains(fileId, "\\") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid filename"})
		return
	}

	// 2. Construct full path
	filePath := filepath.Join(h.UploadDir, fileId)

	log.Println("filePath", filePath)
	log.Println("fileId", fileId)
	log.Println("h.UploadDir", h.UploadDir)

	// 3. Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	// 4. Serve the file
	// Gin's c.File() automatically sets the correct Content-Type and headers
	c.File(filePath)
}
