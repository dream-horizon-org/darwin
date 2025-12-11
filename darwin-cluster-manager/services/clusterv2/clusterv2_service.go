package clusterv2

import (
	"compute/cluster_manager/constants"
	"compute/cluster_manager/dto/clusters"
	"compute/cluster_manager/utils/helm_utils"
	"compute/cluster_manager/utils/kube_utils"
	"compute/cluster_manager/utils/logger"
	"compute/cluster_manager/utils/rest_errors"
	"compute/cluster_manager/utils/s3_utils"
	"fmt"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"os"
)

var (
	ClustersService clustersServiceInterface = &clustersService{}
)

var (
	ChartPath               = constants.ChartPath
	ArtifactStoreS3Prefix   = constants.ArtifactStoreS3Prefix
	LocalArtifactPath       = constants.LocalArtifactPath
	KubeConfigDir           = constants.KubeConfigDir
	ENV                     = constants.ENV
	RayHeadNodeSelector     = constants.RayHeadNodeSelector
	RayNodeReleaseNameLabel = constants.RayNodeReleaseNameLabel
)

// TODO create a process to cleanup artifact and values files in local
type clustersService struct{}

type clustersServiceInterface interface {
	CreateCluster(clusters.Cluster) (*clusters.Cluster, rest_errors.RestErr)
	UpdateCluster(clusters.Cluster) (*clusters.Cluster, rest_errors.RestErr)
	StartCluster(string, string, string, string) rest_errors.RestErr
	StopCluster(string, string, string) rest_errors.RestErr
	RestartCluster(string, string, string, string) rest_errors.RestErr
	ClusterStatus(string, string, string) (kube_utils.ClusterStatusDto, rest_errors.RestErr)
	GetAllClusters(string, string, string) ([]kube_utils.PodReleaseNameDto, rest_errors.RestErr)
}

func (s *clustersService) CreateCluster(cluster clusters.Cluster) (*clusters.Cluster, rest_errors.RestErr) {
	p, restError := helm_utils.PackHelm(ChartPath, cluster.ValuesFilepath, LocalArtifactPath+cluster.ClusterHelmArtifact)
	if restError != nil {
		return nil, restError
	}
	restError = s3_utils.ArtifactsStore.Configure()
	if restError != nil {
		return nil, restError
	}
	artifactName := cluster.ClusterHelmArtifact
	artifactUrl, restError := s3_utils.ArtifactsStore.UploadFile(p, ArtifactStoreS3Prefix+artifactName)
	if restError != nil {
		return nil, restError
	}
	cluster.ArtifactS3Url = artifactUrl
	err := os.RemoveAll(LocalArtifactPath + cluster.ClusterHelmArtifact)
	if err != nil {
		return nil, nil
	}
	err = os.Remove(cluster.ValuesFilepath)
	if err != nil {
		return nil, nil
	}
	return &cluster, nil
}

func (s *clustersService) UpdateCluster(cluster clusters.Cluster) (*clusters.Cluster, rest_errors.RestErr) {
	p, restError := helm_utils.PackHelm(ChartPath, cluster.ValuesFilepath, LocalArtifactPath+cluster.ClusterHelmArtifact)
	if restError != nil {
		return nil, restError
	}
	restError = s3_utils.ArtifactsStore.Configure()
	if restError != nil {
		return nil, restError
	}
	artifactName := cluster.ClusterHelmArtifact
	artifactUrl, restError := s3_utils.ArtifactsStore.UploadFile(p, ArtifactStoreS3Prefix+artifactName)
	if restError != nil {
		return nil, restError
	}
	cluster.ArtifactS3Url = artifactUrl
	err := os.RemoveAll(LocalArtifactPath + cluster.ClusterHelmArtifact)
	if err != nil {
		return nil, nil
	}
	err = os.Remove(cluster.ValuesFilepath)
	if err != nil {
		return nil, nil
	}
	return &cluster, nil
}

func (s *clustersService) StartCluster(clusterName string, artifactName string, namespace string, kubeCluster string) rest_errors.RestErr {
	KubeConfigPath := KubeConfigDir + kubeCluster
	restError := s3_utils.ArtifactsStore.Configure()
	if restError != nil {
		logger.Error("Error configuring s3 store: %v", zap.Error(restError))
		return restError
	}

	uuidPrefix := uuid.New()
	chartLocalPath := CreateChartPath(LocalArtifactPath, artifactName, uuidPrefix.String())
	logger.Info("chartLocalPath for clusterName, artifactName, uuidPrefix: %s in StartCluster", zap.String("chartLocalPath", chartLocalPath))

	restError = s3_utils.ArtifactsStore.DownloadFile(chartLocalPath, ArtifactStoreS3Prefix+artifactName)
	if restError != nil {
		logger.Error("Error downloading file from s3: %v", zap.Error(restError))
		return restError
	}
	_, restError = helm_utils.InstallorUpgradeHelmChartWithRetries(KubeConfigPath, chartLocalPath, clusterName, namespace)
	if restError != nil {
		logger.Error("Error installing helm chart: %v", zap.Error(restError))
		return restError
	}
	err := os.RemoveAll(LocalArtifactPath + artifactName)
	if err != nil {
		return nil
	}
	return nil
}

func (s *clustersService) StopCluster(clusterName string, namespace string, kubeCluster string) rest_errors.RestErr {
	KubeConfigPath := KubeConfigDir + kubeCluster
	_, restError := helm_utils.DeleteHelmRelease(KubeConfigPath, clusterName, namespace)
	if restError != nil {
		return restError
	}
	return nil
}

func (s *clustersService) RestartCluster(clusterName string, artifactName string, namespace string, kubeCluster string) rest_errors.RestErr {
	KubeConfigPath := KubeConfigDir + kubeCluster
	restError := s3_utils.ArtifactsStore.Configure()
	if restError != nil {
		return restError
	}

	uuidPrefix := uuid.New()
	chartLocalPath := CreateChartPath(LocalArtifactPath, artifactName, uuidPrefix.String())
	logger.Info("chartLocalPath for clusterName, artifactName, uuidPrefix: %s in RestartCluster", zap.String("chartLocalPath", chartLocalPath))

	restError = s3_utils.ArtifactsStore.DownloadFile(chartLocalPath, ArtifactStoreS3Prefix+artifactName)
	if restError != nil {
		return restError
	}
	_, restError = helm_utils.RestartHelmRelease(KubeConfigPath, chartLocalPath, clusterName, namespace)
	if restError != nil {
		return restError
	}
	return nil
}

func (s *clustersService) ClusterStatus(clusterName string, namespace string, kubeCluster string) (kube_utils.ClusterStatusDto, rest_errors.RestErr) {
	KubeConfigPath := KubeConfigDir + kubeCluster
	resources, restError := kube_utils.GetResources(clusterName, namespace, KubeConfigPath)
	if restError != nil {
		return kube_utils.ClusterStatusDto{"", nil}, restError
	}
	return resources, nil
}

func (s *clustersService) GetAllClusters(namespace string, kubeCluster string, requestId string) ([]kube_utils.PodReleaseNameDto, rest_errors.RestErr) {
	kubeConfigPath := KubeConfigDir + kubeCluster
	selector := RayHeadNodeSelector + fmt.Sprintf(", environment_name=%s", ENV)
	releaseNameLabel := RayNodeReleaseNameLabel
	logger.DebugR(requestId, fmt.Sprintf("Getting all releases for %s from kube_config_path=%s using selector=%s", kubeConfigPath, selector, releaseNameLabel))
	resources, restError := kube_utils.GetAllReleases(namespace, kubeConfigPath, selector, releaseNameLabel, requestId)
	if restError != nil {
		return nil, restError
	}
	return resources, nil
}
