package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/jaykapade/meeting-assistant/backend/internal/config"
	"github.com/jaykapade/meeting-assistant/backend/internal/db"
	"github.com/jaykapade/meeting-assistant/backend/internal/handler"
	"github.com/jaykapade/meeting-assistant/backend/internal/routes"
	"github.com/jaykapade/meeting-assistant/backend/internal/services"
)

func main() {
	// 1. Load config
	cfg := config.Load()

	// 2. Connect DB
	dbConn, err := db.ConnectDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// err = dbConn.AutoMigrate(&models.Meeting{})

	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	} else {
		fmt.Println("Database migrated successfully")
	}

	// 3. Register services and handlers
	meetingService := services.NewMeetingService(dbConn)
	meetingHandler := handler.NewMeetingHandler(meetingService)
	uploadHandler := handler.NewUploadHandler()
	routeCfg := &routes.RouteConfig{
		MeetingHandler: meetingHandler,
		UploadHandler:  uploadHandler,
	}

	// 4. Register routes
	router := gin.Default()
	routes.RegisterRoutes(router, routeCfg)

	// 5. Start server
	err = router.Run(":8080") // TODO: Make port configurable
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
	fmt.Println("Server started successfully")
}
