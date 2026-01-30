package main

import (
	"context"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jaykapade/meeting-assistant/backend/internal/config"
	"github.com/jaykapade/meeting-assistant/backend/internal/db"
	"github.com/jaykapade/meeting-assistant/backend/internal/handler"
	"github.com/jaykapade/meeting-assistant/backend/internal/routes"
	"github.com/jaykapade/meeting-assistant/backend/internal/services"
	"github.com/jaykapade/meeting-assistant/backend/internal/storage"
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
	// if err != nil {
	// 	log.Fatalf("Failed to migrate database: %v", err)
	// } else {
	// 	fmt.Println("Database migrated successfully")
	// }

	log.Printf("💾 Database connected successfully: %s", cfg.DB.Name)

	//3. Connect Storage
	var store storage.Provider
	ctx := context.Background()

	// This switch allows us to change infrastructure just by changing an ENV var
	switch cfg.Storage.Driver {
	case "minio", "s3":
		store, err = storage.NewS3Provider(
			ctx,
			cfg.Storage.Bucket,
			cfg.Storage.Endpoint,
			cfg.Storage.Region,
			cfg.Storage.AccessKey,
			cfg.Storage.SecretKey,
		)
		if err != nil {
			log.Fatalf("Failed to initialize storage: %v", err)
		}
	case "local":
		// You can implement a simple LocalDiskProvider later if needed
		log.Fatal("Local storage driver not yet implemented")
	default:
		log.Fatalf("Unknown storage driver: %s", cfg.Storage.Driver)
	}

	log.Printf("✅ Storage initialized: %s (Bucket: %s)", cfg.Storage.Driver, cfg.Storage.Bucket)

	// 4. Register services and handlers
	queueService := services.NewQueueService(cfg.Redis.URL)
	meetingService := services.NewMeetingService(dbConn, store)
	meetingHandler := handler.NewMeetingHandler(meetingService, queueService)
	uploadHandler := handler.NewUploadHandler(store)
	routeCfg := &routes.RouteConfig{
		MeetingHandler: meetingHandler,
		UploadHandler:  uploadHandler,
	}

	// 5. Register routes
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

	// 6. Start server
	serverAddr := ":" + cfg.ServerPort
	log.Printf("🚀 Starting server on port %s", cfg.ServerPort)
	err = router.Run(serverAddr)
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
