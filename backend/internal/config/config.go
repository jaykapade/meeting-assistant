package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type DBConfig struct {
	Host     string
	User     string
	Password string
	Name     string
	Port     string
	SSLMode  string
}

type StorageConfig struct {
	Driver    string // "s3", "minio", or "local"
	Bucket    string
	Endpoint  string
	Region    string
	AccessKey string
	SecretKey string
}

type QueueConfig struct {
	URL string // e.g., "localhost:6379" or "redis:6379"
}

type Config struct {
	DB         DBConfig
	Storage    StorageConfig
	Redis      QueueConfig
	ServerPort string
}

func Load() *Config {
	// 1. Load .env file (if it exists)
	// We don't panic here because in Production (Docker), the file might not exist
	// and vars are set by the orchestrator.
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system environment variables")
	}

	return &Config{
		DB: DBConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASS", "postgres"),
			Name:     getEnv("DB_NAME", "meeting_assistant"),
			Port:     getEnv("DB_PORT", "5432"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"), // Default to disable for dev
		},
		Storage: StorageConfig{
			Driver:    getEnv("STORAGE_DRIVER", "minio"), // Default to minio for dev
			Bucket:    getEnv("STORAGE_BUCKET", "meeting-assistant"),
			Endpoint:  getEnv("STORAGE_ENDPOINT", "http://localhost:9000"),
			Region:    getEnv("STORAGE_REGION", "us-east-1"),
			AccessKey: getEnv("STORAGE_ACCESS_KEY", "minioadmin"),
			SecretKey: getEnv("STORAGE_SECRET_KEY", "minioadmin"),
		},
		Redis: QueueConfig{
			URL: getEnv("REDIS_URL", "localhost:6379"), // Default to localhost for dev
		},
		ServerPort: getEnv("SERVER_PORT", "8080"), // Default to 8080
	}
}

// Helper to read env with a default fallback
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
