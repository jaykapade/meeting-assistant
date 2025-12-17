package main

import (
	"fmt"
	"log"

	"github.com/gin-contrib/cors"
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
	queueService := services.NewQueueService("localhost:6379")
	meetingService := services.NewMeetingService(dbConn)
	meetingHandler := handler.NewMeetingHandler(meetingService, queueService)
	uploadHandler := handler.NewUploadHandler()
	routeCfg := &routes.RouteConfig{
		MeetingHandler: meetingHandler,
		UploadHandler:  uploadHandler,
	}

	// 4. Register routes
	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"http://127.0.0.1:3000",
		},
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders: []string{
			"Content-Length",
		},
		AllowCredentials: true,
	}))
	routes.RegisterRoutes(router, routeCfg)

	// 5. Start server
	err = router.Run(":8080") // TODO: Make port configurable
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
	fmt.Println("Server started successfully")
}
