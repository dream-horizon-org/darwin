package spark_history_server_service

import (
	"compute/cluster_manager/constants"
	"compute/cluster_manager/dto/spark_history_server"
	"compute/cluster_manager/utils/helm_utils"
	"compute/cluster_manager/utils/kube_utils"
	"compute/cluster_manager/utils/kubeconfig_utils"
	"compute/cluster_manager/utils/rest_errors"
	"compute/cluster_manager/utils/s3_utils"
)

var (
	SparkHistoryServerChartPath               = constants.SparkHistoryServerChartPath
	LocalArtifactPath                         = constants.LocalArtifactPath
	LocalSparkHistoryServerArtifactValuesPath = constants.LocalSparkHistoryServerArtifactValuesPath
	ArtifactStoreS3Prefix                     = constants.SparkHistoryServerArtifactS3Prefix
	ENV                                       = constants.ENV
)

type SparkHistoryServerService struct{}

type SparkHistoryServerInterface interface {
	StartSparkHistoryServer(spark_history_server.StartSparkHistoryServerParams) SparkHistoryServerResponse
	StopSparkHistoryServer(spark_history_server.StopSparkHistoryServerParams) SparkHistoryServerResponse
	GetSparkHistoryServer(string, string, string) SparkHistoryServerResponse
}

type SparkHistoryServerResponse struct {
	Status  string
	Message string
	Data    interface{}
}

type SparkHistoryServerStatus struct {
	PodsCount int
	Resources []SparkHistoryServerResource
}

type SparkHistoryServerResource struct {
	Name   string
	Status string
}

func (s *SparkHistoryServerService) StartSparkHistoryServer(requestParams spark_history_server.StartSparkHistoryServerParams) SparkHistoryServerResponse {
	if err := s3_utils.ArtifactsStore.Configure(); err != nil {
		return SparkHistoryServerResponse{Status: "ERROR", Message: "Internal Server Error", Data: rest_errors.NewInternalServerError("Failed to initialize S3 client", err)}
	}

	_, err := s3_utils.ArtifactsStore.CreateFolder(ArtifactStoreS3Prefix + requestParams.Resource + "/")
	if err != nil {
		return SparkHistoryServerResponse{Status: "ERROR", Message: "Internal Server Error", Data: rest_errors.NewInternalServerError("Failed to create folder in S3", err)}
	}

	filePath, helmError := MakeHelmChart(requestParams, ENV)
	if helmError != nil {
		return SparkHistoryServerResponse{Status: "ERROR", Message: "Internal Server Error", Data: rest_errors.NewInternalServerError("Failed to make helm chart", helmError)}
	}

	path, err := helm_utils.PackHelm(SparkHistoryServerChartPath, filePath, LocalArtifactPath+requestParams.Id)
	if err != nil {
		return SparkHistoryServerResponse{Status: "ERROR", Message: "Internal Server Error", Data: rest_errors.NewInternalServerError("Failed to release helm ", err)}
	}

	ReleaseKubeConfigPath, kubeConfigErr := kubeconfig_utils.GetKubeConfigPath(requestParams.KubeCluster)
	if kubeConfigErr != nil {
		return SparkHistoryServerResponse{Status: "ERROR", Message: "Internal Server Error", Data: kubeConfigErr}
	}
	_, err = helm_utils.InstallorUpgradeHelmChartWithRetries(ReleaseKubeConfigPath, path, requestParams.Id, requestParams.Namespace)
	if err != nil {
		return SparkHistoryServerResponse{Status: "ERROR", Message: "Internal Server Error", Data: rest_errors.NewInternalServerError("Unable to release helm ", err)}
	}

	deleteFileErr := DeleteSparkHistoryServerArtifacts(requestParams.Id)
	if deleteFileErr.Data != nil {
		return deleteFileErr
	}

	return SparkHistoryServerResponse{Status: "SUCCESS", Message: "Helm Chart Applied Successfully", Data: nil}
}

func (s *SparkHistoryServerService) StopSparkHistoryServer(requestParams spark_history_server.StopSparkHistoryServerParams) SparkHistoryServerResponse {
	KubeConfigPath, kubeConfigErr := kubeconfig_utils.GetKubeConfigPath(requestParams.KubeCluster)
	if kubeConfigErr != nil {
		return SparkHistoryServerResponse{Status: "ERROR", Message: "Internal Server Error", Data: kubeConfigErr}
	}
	_, restError := helm_utils.DeleteHelmRelease(KubeConfigPath, requestParams.Id, requestParams.Namespace)
	if restError != nil {
		return SparkHistoryServerResponse{Status: "ERROR", Message: "Internal Server Error", Data: restError}
	}
	return SparkHistoryServerResponse{Status: "SUCCESS", Message: "Helm Chart Uninstalled Successfully", Data: nil}
}

func (s *SparkHistoryServerService) GetSparkHistoryServer(id string, kubeCluster string, namespace string) SparkHistoryServerResponse {
	KubeConfigPath, kubeConfigErr := kubeconfig_utils.GetKubeConfigPath(kubeCluster)
	if kubeConfigErr != nil {
		return SparkHistoryServerResponse{Status: "ERROR", Message: "Internal Server Error", Data: kubeConfigErr}
	}
	resources, restError := kube_utils.GetPods(id, namespace, "app.kubernetes.io/name="+id, KubeConfigPath)
	if restError != nil {
		return SparkHistoryServerResponse{Status: "ERROR", Message: "Internal Server Error", Data: restError}
	}

	var SparkHistoryServerStatus SparkHistoryServerStatus
	SparkHistoryServerStatus.PodsCount = len(resources)
	for _, pod := range resources {
		SparkHistoryServerStatus.Resources = append(SparkHistoryServerStatus.Resources, SparkHistoryServerResource{pod.Name, string(pod.Status)})
	}
	return SparkHistoryServerResponse{Status: "SUCCESS", Message: "Spark History Server Status Fetched Successfully", Data: map[string]interface{}{
		"Resources": SparkHistoryServerStatus,
	}}
}
