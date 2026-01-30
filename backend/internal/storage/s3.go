package storage

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3Provider struct {
	client *s3.Client
	bucket string
}

// Ensure S3Provider satisfies the interface at compile time
var _ Provider = (*S3Provider)(nil)

func NewS3Provider(ctx context.Context, bucket, endpoint, region, accessKey, secretKey string) (*S3Provider, error) {
	log.Printf("Initializing S3 provider - Endpoint: %s, Bucket: %s, Region: %s", endpoint, bucket, region)

	// Parse the endpoint URL to ensure it's valid
	endpointURL, err := url.Parse(endpoint)
	if err != nil {
		log.Printf("Invalid endpoint URL: %v", err)
		return nil, fmt.Errorf("invalid endpoint URL: %w", err)
	}

	// Create a custom HTTP client with proper timeout
	httpClient := &http.Client{
		Timeout: 30 * time.Second,
	}

	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion(region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
		config.WithHTTPClient(httpClient),
	)

	if err != nil {
		log.Printf("Failed to load AWS config: %v", err)
		return nil, err
	}

	// Create S3 client with custom endpoint
	// For MinIO with HTTP, we need to use the full endpoint URL
	// The SDK should respect the protocol in the BaseEndpoint
	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		// BaseEndpoint with full URL including protocol
		// This should force the SDK to use HTTP instead of defaulting to HTTPS
		o.BaseEndpoint = aws.String(endpoint)
		o.UsePathStyle = true
	})

	log.Printf("Endpoint URL parsed - Scheme: %s, Host: %s, Full endpoint: %s", endpointURL.Scheme, endpointURL.Host, endpoint)

	log.Printf("S3 provider initialized successfully with endpoint: %s", endpoint)
	return &S3Provider{
		client: client,
		bucket: bucket,
	}, nil
}

func (p *S3Provider) Upload(ctx context.Context, file io.Reader, key string, contentType string) (*UploadResult, error) {
	log.Printf("Uploading file to bucket: %s, key: %s", p.bucket, key)

	// Upload the file to S3
	_, err := p.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(p.bucket),
		Key:         aws.String(key),
		Body:        file,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		log.Printf("S3 PutObject error: %v", err)
		return nil, fmt.Errorf("failed to upload to S3: %w", err)
	}

	log.Printf("Successfully uploaded file: %s", key)

	// Return the upload result
	return &UploadResult{
		Key:      key,
		URL:      "", // Can be populated with GetSignedURL if needed
		MimeType: contentType,
	}, nil
}

func (p *S3Provider) Delete(ctx context.Context, key string) error {
	// TODO: Implement
	return nil
}

func (p *S3Provider) GetSignedURL(ctx context.Context, key string) (string, error) {
	// TODO: Implement
	return "", nil
}
