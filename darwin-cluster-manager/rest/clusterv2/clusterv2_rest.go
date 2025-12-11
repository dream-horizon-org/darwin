package clusterv2

import (
	"compute/cluster_manager/constants"
	"compute/cluster_manager/dto/clusters"
	"compute/cluster_manager/services/clusterv2"
	"compute/cluster_manager/utils/logger"
	"compute/cluster_manager/utils/rest_errors"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"net/http"
)

var (
	LocalValuesFolder = constants.LocalValuesFolder
	DashboardSuffix   = constants.DashboardSuffix
	JupyterSuffix     = constants.JupyterSuffix
	MetricsSuffix     = constants.MetricsSuffix
)

type ResponseforCreate struct {
	ClusterName         string
	ClusterHelmArtifact string
	ArtifactS3Url       string
}

type ResponseforStart struct {
	ClusterName   string
	Namespace     string
	KubeCluster   string
}

func Create(c *gin.Context) {
	requestId := c.GetString("requestID")
	var cluster clusters.Cluster
	cluster.ClusterName, _ = c.GetPostForm("cluster_name")
	cluster.ClusterHelmArtifact, _ = c.GetPostForm("artifact_name")
	restError := cluster.Validate()
	if restError != nil {
		c.JSON(restError.Status(), restError)
		logger.ErrorR(requestId, restError.Message(), zap.Error(restError))
		return
	}
	file, err := c.FormFile("file")
	if err != nil {
		restError := rest_errors.NewBadRequestError("Invalid config file", err)
		c.JSON(restError.Status(), restError)
		logger.ErrorR(requestId, restError.Message(), zap.Error(restError))
		return
	}
	filename := LocalValuesFolder + cluster.ClusterName + "-" + file.Filename
	if err := c.SaveUploadedFile(file, filename); err != nil {
		restError := rest_errors.NewInternalServerError("failed to save the file", err)
		c.JSON(restError.Status(), restError)
		logger.ErrorR(requestId, restError.Message(), zap.Error(restError))
		return
	}
	cluster.ValuesFilepath = filename

	result, restError := clusterv2.ClustersService.CreateCluster(cluster)
	if restError != nil {
		c.JSON(restError.Status(), restError)
		logger.ErrorR(requestId, restError.Message(), zap.Error(restError))
		return
	}
	response := ResponseforCreate{result.ClusterName, result.ClusterHelmArtifact, result.ArtifactS3Url}
	logger.InfoR(requestId, "Cluster created", zap.Any("response", response))
	c.JSON(http.StatusCreated, response)
}

func Update(c *gin.Context) {
	requestId := c.GetString("requestID")
	file, err := c.FormFile("file")
	if err != nil {
		restError := rest_errors.NewBadRequestError("invalid config file", err)
		c.JSON(restError.Status(), restError)
		logger.ErrorR(requestId, restError.Message(), zap.Error(restError))
		return
	}
	var cluster clusters.Cluster
	cluster.ClusterName, _ = c.GetPostForm("cluster_name")
	cluster.ClusterHelmArtifact, _ = c.GetPostForm("artifact_name")
	filename := LocalValuesFolder + cluster.ClusterName + "-" + file.Filename
	if err := c.SaveUploadedFile(file, filename); err != nil {
		restError := rest_errors.NewInternalServerError("failed to save the file", err)
		c.JSON(restError.Status(), restError)
		logger.ErrorR(requestId, restError.Message(), zap.Error(restError))
		return
	}
	cluster.ValuesFilepath = filename
	restError := cluster.Validate()
	if restError != nil {
		c.JSON(restError.Status(), restError)
		logger.ErrorR(requestId, restError.Message(), zap.Error(restError))
		return
	}
	result, restError := clusterv2.ClustersService.UpdateCluster(cluster)
	if restError != nil {
		c.JSON(restError.Status(), restError)
		logger.ErrorR(requestId, restError.Message(), zap.Error(restError))
		return
	}
	response := ResponseforCreate{result.ClusterName, result.ClusterHelmArtifact, result.ArtifactS3Url}
	c.JSON(http.StatusCreated, response)
}

func Start(c *gin.Context) {
	requestID := c.GetString("requestID")
	clusterName, _ := c.GetPostForm("cluster_name")
	artifactName, _ := c.GetPostForm("artifact_name")
	namespace, _ := c.GetPostForm("namespace")
	kubeCluster, _ := c.GetPostForm("kube_cluster")
	restError := clusterv2.ClustersService.StartCluster(clusterName, artifactName, namespace, kubeCluster)
	if restError != nil {
		c.JSON(restError.Status(), restError)
		logger.ErrorR(requestID, restError.Message(), zap.Error(restError))
		return
	}
	response := ResponseforStart{clusterName, namespace, kubeCluster}
	c.JSON(http.StatusAccepted, response)
}

func Stop(c *gin.Context) {
	requestID := c.GetString("requestID")
	clusterName, _ := c.GetPostForm("cluster_name")
	namespace, _ := c.GetPostForm("namespace")
	kubeCluster, _ := c.GetPostForm("kube_cluster")
	restError := clusterv2.ClustersService.StopCluster(clusterName, namespace, kubeCluster)
	if restError != nil {
		c.JSON(restError.Status(), restError)
		logger.ErrorR(requestID, restError.Message(), zap.Error(restError))
		return
	}
	c.JSON(http.StatusAccepted, "clusterv2 Stopped")
}

func Restart(c *gin.Context) {
	requestId := c.GetString("requestID")
	clusterName, _ := c.GetPostForm("cluster_name")
	artifactName, _ := c.GetPostForm("artifact_name")
	namespace, _ := c.GetPostForm("namespace")
	kubeCluster, _ := c.GetPostForm("kube_cluster")
	restError := clusterv2.ClustersService.RestartCluster(clusterName, artifactName, namespace, kubeCluster)
	if restError != nil {
		c.JSON(restError.Status(), restError)
		logger.ErrorR(requestId, restError.Message(), zap.Error(restError))
		return
	}
	response := ResponseforStart{clusterName, namespace, kubeCluster}
	c.JSON(http.StatusAccepted, response)
}

func Status(c *gin.Context) {
	requestId := c.GetString("requestID")
	clusterName, _ := c.GetPostForm("cluster_name")
	namespace, _ := c.GetPostForm("namespace")
	kubeCluster, _ := c.GetPostForm("kube_cluster")
	response, restError := clusterv2.ClustersService.ClusterStatus(clusterName, namespace, kubeCluster)
	if restError != nil {
		c.JSON(restError.Status(), restError)
		logger.ErrorR(requestId, restError.Message(), zap.Error(restError))
		return
	}
	logger.InfoR(requestId, "Cluster status retrieved", zap.Any("response", response))
	c.JSON(http.StatusAccepted, response)
}

func GetAll(c *gin.Context) {
	requestId := c.GetString("requestID")
	namespace := c.Query("namespace")
	if namespace == "" {
		restError := rest_errors.NewBadRequestError("No namespace specified", nil)
		c.JSON(http.StatusInternalServerError, restError)
		logger.ErrorR(requestId, restError.Message(), zap.Error(restError))
		return
	}
	kubeCluster := c.Query("kube_cluster")
	if kubeCluster == "" {
		restError := rest_errors.NewBadRequestError("No kube cluster specified", nil)
		c.JSON(http.StatusInternalServerError, restError)
		logger.ErrorR(requestId, restError.Message(), zap.Error(restError))
		return
	}

	response, restError := clusterv2.ClustersService.GetAllClusters(namespace, kubeCluster, requestId)
	if restError != nil {
		c.JSON(restError.Status(), restError)
		logger.ErrorR(requestId, restError.Message(), zap.Error(restError))
		return
	}
	c.JSON(http.StatusAccepted, response)
}
