package main

import (
	"log"

	"github.com/jaykapade/meeting-assistant/backend/internal/config"
	"github.com/jaykapade/meeting-assistant/backend/internal/db"
)

func main() {
	// 1. Load config
	cfg := config.Load()
	// 2. Connect DB
	_, err := db.ConnectDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	// 3. Setup router
	// 4. Start server

}
