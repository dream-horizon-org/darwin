package resource_instance

type ResourceInstanceResponse struct {
	Status  string      `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

type PodsData struct {
	Name    string `json:"name"`
	Status  string `json:"status"`
	Message string `json:"message"`
}

type CanaryStatus struct {
	Name               string `json:"name"`
	Phase              string `json:"phase"`
	CanaryWeight       int64  `json:"canary_weight"`
	FailedChecks       int64  `json:"failed_checks"`
	LastTransitionTime string `json:"last_transition_time"`
}

type ResourceStatus struct {
	Pods   []PodsData    `json:"pods"`
	Canary *CanaryStatus `json:"canary,omitempty"`
}
