package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type QueueService struct {
	Client *redis.Client
}

type MeetingJob struct {
	ID       uint   `json:"id"`
	FilePath string `json:"file_path"`
}

func NewQueueService(addr string) *QueueService {
	client := redis.NewClient(&redis.Options{
		Addr: addr, // e.g., "localhost:6379"
	})
	return &QueueService{Client: client}
}

func (q *QueueService) EnqueueMeeting(meetingID uint, filePath string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 1. Create the Payload
	job := MeetingJob{
		ID:       meetingID,
		FilePath: filePath,
	}

	jobJSON, err := json.Marshal(job)
	if err != nil {
		return fmt.Errorf("failed to marshal job: %v", err)
	}

	// 2. Push to Redis List (RPUSH appends to the tail)
	// "meeting_jobs" matches the QUEUE_NAME in your Python script
	err = q.Client.RPush(ctx, "meeting_jobs", jobJSON).Err()
	if err != nil {
		return fmt.Errorf("failed to enqueue job: %v", err)
	}

	return nil
}
