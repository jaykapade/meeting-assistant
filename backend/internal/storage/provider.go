package storage

import (
	"context"
	"io"
)

type UploadResult struct {
	Key      string
	URL      string
	Size     int64
	MimeType string
}

type Provider interface {
	Upload(ctx context.Context, file io.Reader, key string, contentType string) (*UploadResult, error)
	Delete(ctx context.Context, key string) error
	GetSignedURL(ctx context.Context, key string) (string, error)
}
