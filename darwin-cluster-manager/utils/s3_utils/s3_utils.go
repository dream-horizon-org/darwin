package s3_utils

import (
	"bytes"
	"compute/cluster_manager/constants"
	"compute/cluster_manager/utils/rest_errors"
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

var (
	ArtifactsStore artifactsStoreInterface = &artifactsStore{}
)
var (
	AwsEndpoint = constants.AwsEndpoint
	AwsS3Region = constants.AwsS3Region
	AwsS3Bucket = constants.AwsS3Bucket[constants.ENV]
)

var awsS3Client *s3.Client

type artifactsStore struct{}

type artifactsStoreInterface interface {
	Configure() rest_errors.RestErr
	UploadFile(filepath string, s3Key string) (string, rest_errors.RestErr)
	DownloadFile(fileDestination string, s3Key string) rest_errors.RestErr
	CreateFolder(folderPath string) (string, rest_errors.RestErr)
}

func (s *artifactsStore) Configure() rest_errors.RestErr {
	customResolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		if AwsEndpoint != "" {
			return aws.Endpoint{
				PartitionID:   "aws",
				URL:           AwsEndpoint,
				SigningRegion: AwsS3Region,
			}, nil
		}

		// returning EndpointNotFoundError will allow the service to fallback to it's default resolution
		return aws.Endpoint{}, &aws.EndpointNotFoundError{}
	})

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(AwsS3Region),
		config.WithEndpointResolverWithOptions(customResolver),
	)
	if err != nil {
		restError := rest_errors.NewInternalServerError("S3 config failed", err)
		return restError
	}

	awsS3Client = s3.NewFromConfig(cfg, func(o *s3.Options) {
		// Use path style only when using LocalStack
		if AwsEndpoint != "" {
			o.UsePathStyle = true
		}
	})
	return nil
}

func (s *artifactsStore) UploadFile(filepath string, s3Key string) (string, rest_errors.RestErr) {
	input, err := os.Open(filepath)
	if err != nil {
		restError := rest_errors.NewInternalServerError("failed to open file", err)
		return "", restError
	}
	uploader := manager.NewUploader(awsS3Client)
	uploadOutput, err := uploader.Upload(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(AwsS3Bucket),
		Key:    aws.String(s3Key),
		Body:   input,
	})
	if err != nil {
		restError := rest_errors.NewInternalServerError("failed to upload to S3", err)
		return "", restError
	}
	return uploadOutput.Location, nil
}

func (s *artifactsStore) DownloadFile(fileDestination string, s3Key string) rest_errors.RestErr {
	newFile, err := os.Create(fileDestination)
	if err != nil {
		restError := rest_errors.NewInternalServerError("Something went wrong creating the local file", err)
		return restError
	}
	defer newFile.Close()

	downloader := manager.NewDownloader(awsS3Client)
	_, err = downloader.Download(context.TODO(), newFile, &s3.GetObjectInput{
		Bucket: aws.String(AwsS3Bucket),
		Key:    aws.String(s3Key),
	})
	if err != nil {
		os.Remove(fileDestination)
		restError := rest_errors.NewInternalServerError(fmt.Sprintf("Something went wrong retrieving the file from S3 with path %s", s3Key), err)
		return restError
	}
	return nil
}

func (s *artifactsStore) CreateFolder(folderPath string) (string, rest_errors.RestErr) {
	uploader := manager.NewUploader(awsS3Client)
	uploadOutput, err := uploader.Upload(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(AwsS3Bucket),
		Key:    aws.String(folderPath),
		Body:   bytes.NewReader([]byte{}), // Representing an empty body for folder creation
	})
	if err != nil {
		restError := rest_errors.NewInternalServerError("failed to create folder in s3", err)
		return "", restError
	}
	return uploadOutput.Location, nil
}
