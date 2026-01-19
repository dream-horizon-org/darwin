package jupyter_client_service

import (
	"compute/cluster_manager/constants"
	"compute/cluster_manager/dto/jupyter"
	"compute/cluster_manager/utils/helm_utils"
	"compute/cluster_manager/utils/kubeconfig_utils"
	"compute/cluster_manager/utils/rest_errors"
	"fmt"
)

var (
	JupyterChartPath               = constants.JupyterChartPath
	LocalArtifactPath              = constants.LocalArtifactPath
	LocalJupyterArtifactValuesPath = constants.LocalJupyterArtifactValuesPath
	JupyterSuffix                  = constants.JupyterSuffix
	ENV                            = constants.ENV
	URL                            = constants.URL
)

const (
	LocalValuesFolder = "./tmp/values/jupyter/"
)

type JupyterService struct{}

type JupyterClientInterface interface {
	CreateJupyterClient(jupyter.Params) (string, rest_errors.RestErr)
}

type JupyterClientResponse struct {
	JupyterLink string
	Message     string
	Err         rest_errors.RestErr
}

func (j *JupyterService) CreateJupyterClient(params jupyter.Params) JupyterClientResponse {
	err := params.Validate()
	if err != nil {
		return JupyterClientResponse{Message: "", Err: rest_errors.NewInternalServerError("Invalid params", err), JupyterLink: ""}
	}

	ReleaseKubeConfigPath, kubeConfigErr := kubeconfig_utils.GetKubeConfigPath(params.KubeConfig)
	if kubeConfigErr != nil {
		return JupyterClientResponse{Message: "", Err: kubeConfigErr, JupyterLink: ""}
	}

	filePath, helmError := MakeHelmChart(params)

	if helmError != nil {
		return JupyterClientResponse{Message: "", Err: rest_errors.NewInternalServerError("Failed to make helm chart", err), JupyterLink: ""}
	}

	path, err := helm_utils.PackHelm(JupyterChartPath, filePath, LocalArtifactPath+params.ReleaseName)
	if err != nil {
		return JupyterClientResponse{Message: "", Err: rest_errors.NewInternalServerError("Failed to release helm ", err), JupyterLink: ""}
	}

	jupyterLink := fmt.Sprintf(URL[ENV] + "/" + params.KubeClusterKey + "/" + params.ReleaseName + JupyterSuffix)
	_, err = helm_utils.InstallorUpgradeHelmChartWithRetries(ReleaseKubeConfigPath, path, params.ReleaseName, params.Namespace)
	if err != nil {
		return JupyterClientResponse{Message: "", Err: rest_errors.NewInternalServerError("Unable to release helm ", err), JupyterLink: jupyterLink}
	}

	deleteFileErr := DeleteJupyterArtifacts(params.ReleaseName)
	if deleteFileErr.Err != nil {
		return deleteFileErr
	}

	return JupyterClientResponse{Message: "Release initiated", Err: nil, JupyterLink: jupyterLink}
}

func (j *JupyterService) DeleteJupyterClient(params jupyter.DeleteParams) JupyterClientResponse {
	err := params.Validate()
	if err != nil {
		return JupyterClientResponse{
			Message:     "",
			Err:         rest_errors.NewInternalServerError("Unable to release helm to delete jupyter client", err),
			JupyterLink: "",
		}
	}

	ReleaseKubeConfigPath, kubeConfigErr := kubeconfig_utils.GetKubeConfigPath(params.KubeConfig)
	if kubeConfigErr != nil {
		return JupyterClientResponse{
			Message:     "",
			Err:         kubeConfigErr,
			JupyterLink: "",
		}
	}

	_, err = helm_utils.DeleteHelmRelease(ReleaseKubeConfigPath, params.ReleaseName, params.Namespace)
	if err != nil {
		return JupyterClientResponse{
			Message:     "",
			Err:         rest_errors.NewInternalServerError("Unable to release helm to delete jupyter client", err),
			JupyterLink: "",
		}
	}

	deleteFileErr := DeleteJupyterArtifacts(params.ReleaseName)
	if deleteFileErr.Err != nil {
		return deleteFileErr
	}

	return JupyterClientResponse{
		Message:     "Jupyter client deleted",
		Err:         nil,
		JupyterLink: "",
	}
}

func (j *JupyterService) RestartJupyterClient(params jupyter.Params) JupyterClientResponse {
	var jupyterService JupyterService

	deleteParams := jupyter.DeleteParams{
		ReleaseName: params.ReleaseName,
		KubeConfig:  params.KubeConfig,
		Namespace:   params.Namespace,
	}

	deleteJupyterResponse := jupyterService.DeleteJupyterClient(deleteParams)
	if deleteJupyterResponse.Err != nil {
		return JupyterClientResponse{
			Message:     "",
			Err:         rest_errors.NewInternalServerError("Unable to release helm to delete jupyter client for restart", deleteJupyterResponse.Err),
			JupyterLink: "",
		}
	}

	createJupyterResponse := jupyterService.CreateJupyterClient(params)
	if createJupyterResponse.Err != nil {
		return JupyterClientResponse{
			Message:     "",
			Err:         rest_errors.NewInternalServerError("Unable to create helm to start jupyter client", createJupyterResponse.Err),
			JupyterLink: "",
		}
	}

	jupyterLink := fmt.Sprintf(URL[ENV] + "/" + params.KubeClusterKey + "/" + params.ReleaseName + JupyterSuffix)
	return JupyterClientResponse{
		Message:     "Jupyter restarted",
		Err:         nil,
		JupyterLink: jupyterLink,
	}
}
