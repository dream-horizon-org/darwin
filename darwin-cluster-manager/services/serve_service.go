package services

import (
	"compute/cluster_manager/constants"
	"compute/cluster_manager/dto/serve"
	"compute/cluster_manager/utils/helm_utils"
	"compute/cluster_manager/utils/kube_utils"
	"compute/cluster_manager/utils/kubeconfig_utils"
	"compute/cluster_manager/utils/rest_errors"
	"compute/cluster_manager/utils/s3_utils"
	"os"
)

var (
	ArtifactStoreS3Prefix                        = constants.ArtifactStoreS3Prefix
	LocalArtifactPath                            = constants.LocalArtifactPath
	ENV                                          = constants.ENV
	URL                                          = constants.URL
	ServeChartPathMap                            = constants.ServeChartPath
	ServesService         servesServiceInterface = &servesService{}
)

// TODO create a process to cleanup artifact and values files in local
type servesService struct{}

type servesServiceInterface interface {
	CreateServe(serve.Serve) (*serve.Serve, rest_errors.RestErr)
	StartServe(string, string, string, string) (string, rest_errors.RestErr)
	StopServe(string, string, string) rest_errors.RestErr
	ServeStatus(string, string, string, string) (kube_utils.ServeStatusDto, rest_errors.RestErr)
}

func (s *servesService) CreateServe(serve serve.Serve) (*serve.Serve, rest_errors.RestErr) {
	serveChartPath := ServeChartPathMap[serve.Framework]
	// TODO add UUID for LocalArtifactPath to avoid race conditions
	p, restError := helm_utils.PackHelm(serveChartPath, serve.ValuesFilepath, LocalArtifactPath+serve.ServeHelmArtifact)
	if restError != nil {
		return nil, restError
	}
	restError = s3_utils.ArtifactsStore.Configure()
	if restError != nil {
		return nil, restError
	}
	artifactName := serve.ServeHelmArtifact
	artifacturl, restError := s3_utils.ArtifactsStore.UploadFile(p, ArtifactStoreS3Prefix+artifactName)
	if restError != nil {
		return nil, restError
	}
	serve.ArtifactS3Url = artifacturl
	err := os.RemoveAll(LocalArtifactPath + serve.ServeHelmArtifact)
	if err != nil {
		return nil, nil
	}
	err = os.Remove(serve.ValuesFilepath)
	if err != nil {
		return nil, nil
	}
	return &serve, nil
}

func (s *servesService) StartServe(serveName string, artifactName string, namespace string, kubeCluster string) (string, rest_errors.RestErr) {
	KubeConfigPath, restError := kubeconfig_utils.GetKubeConfigPath(kubeCluster)
	if restError != nil {
		return "", restError
	}
	restError = s3_utils.ArtifactsStore.Configure()
	if restError != nil {
		return "", restError
	}
	chartLocalPath := LocalArtifactPath + artifactName
	restError = s3_utils.ArtifactsStore.DownloadFile(chartLocalPath, ArtifactStoreS3Prefix+artifactName)
	if restError != nil {
		return "", restError
	}
	_, restError = helm_utils.InstallorUpgradeHelmChartWithRetries(KubeConfigPath, chartLocalPath, serveName, namespace)
	if restError != nil {
		return "", restError
	}
	return URL[ENV], nil
}

func (s *servesService) StopServe(serveName string, namespace string, kubeCluster string) rest_errors.RestErr {
	KubeConfigPath, restError := kubeconfig_utils.GetKubeConfigPath(kubeCluster)
	if restError != nil {
		return restError
	}
	_, restError = helm_utils.DeleteHelmRelease(KubeConfigPath, serveName, namespace)
	if restError != nil {
		return restError
	}
	return nil
}

func (s *servesService) ServeStatus(serveName string, namespace string, framework string, kubeCluster string) (kube_utils.ServeStatusDto, rest_errors.RestErr) {
	KubeConfigPath, restError := kubeconfig_utils.GetKubeConfigPath(kubeCluster)
	if restError != nil {
		return kube_utils.ServeStatusDto{}, restError
	}
	if framework == "ray" {
		resources, restError := kube_utils.GetRayServeStatus(serveName, namespace, KubeConfigPath)
		if restError != nil {
			return kube_utils.ServeStatusDto{}, restError
		}
		return resources, nil
	} else if framework == "fastapi" {
		resources, restError := kube_utils.GetFastapiServeStatus(serveName, namespace, KubeConfigPath)
		if restError != nil {
			return kube_utils.ServeStatusDto{}, restError
		}
		return resources, nil
	} else {
		return kube_utils.ServeStatusDto{}, rest_errors.NewBadRequestError("framework not supported", nil)
	}
}
