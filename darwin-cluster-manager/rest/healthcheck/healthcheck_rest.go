package healthcheck

import (
	"compute/cluster_manager/utils/logger"
	"github.com/gin-gonic/gin"
	"net/http"
)

func Healthcheck(c *gin.Context) {
	requestId := c.GetString("requestID")
	c.JSON(http.StatusOK, gin.H{
		"status":  "SUCCESS",
		"message": "OK",
	})
	logger.InfoR(requestId, "Healthcheck Active")
}
