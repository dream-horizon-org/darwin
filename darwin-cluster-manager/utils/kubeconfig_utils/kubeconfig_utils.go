package kubeconfig_utils

import (
	"compute/cluster_manager/constants"
	"compute/cluster_manager/utils/rest_errors"
	"compute/cluster_manager/utils/s3_utils"
	"os"
	"sync"
)

// configLocks holds per-cluster mutexes to prevent concurrent downloads of the same kubeconfig
var configLocks sync.Map // map[clusterName]*sync.Mutex

// getClusterLock returns a mutex for the given cluster name, creating one if it doesn't exist
func getClusterLock(clusterName string) *sync.Mutex {
	lock, _ := configLocks.LoadOrStore(clusterName, &sync.Mutex{})
	return lock.(*sync.Mutex)
}

// fileExists checks if a file exists at the given path
func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// GetKubeConfigPath returns the path to the kubeconfig file for the given cluster.
// It first checks if the file exists locally. If not, it downloads from S3.
// Uses double-checked locking to ensure only one goroutine downloads a specific config at a time.
func GetKubeConfigPath(kubeCluster string) (string, rest_errors.RestErr) {
	localPath := constants.KubeConfigDir + kubeCluster

	// Fast path: file already exists locally
	if fileExists(localPath) {
		return localPath, nil
	}

	// Acquire per-cluster lock to prevent concurrent downloads
	lock := getClusterLock(kubeCluster)
	lock.Lock()
	defer lock.Unlock()

	// Double-check after acquiring lock (another goroutine may have downloaded it)
	if fileExists(localPath) {
		return localPath, nil
	}

	// Ensure the configs directory exists
	if err := os.MkdirAll(constants.KubeConfigDir, 0755); err != nil {
		return "", rest_errors.NewInternalServerError("Failed to create configs directory", err)
	}

	// Configure S3 client
	if err := s3_utils.ArtifactsStore.Configure(); err != nil {
		return "", err
	}

	// Download from S3
	s3Key := constants.KubeConfigS3Prefix + kubeCluster
	if err := s3_utils.ArtifactsStore.DownloadFile(localPath, s3Key); err != nil {
		return "", rest_errors.NewInternalServerError(
			"Failed to download kubeconfig from S3. Ensure the file exists at s3://"+s3Key,
			err,
		)
	}

	return localPath, nil
}
