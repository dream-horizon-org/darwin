"""DaoResponse model to replace mlp_commons.models.dao_response"""
from typing import Generic, TypeVar, Optional, Any, Tuple

T = TypeVar('T')


class DaoResponse(Generic[T]):
    """Response wrapper for DAO operations"""
    
    def __init__(self, success: bool, data: Optional[T] = None, error_code: Optional[str] = None, 
                 error_message: Optional[str] = None, status: Optional[str] = None):
        self.success = success
        self.data = data
        self.error_code = error_code
        self.error_message = error_message
        # Set status based on success if not provided
        if status is None:
            self._status = "error" if not success else "success"
        else:
            self._status = status
    
    @property
    def status(self) -> str:
        """Status property that returns 'error' or 'success'"""
        return self._status if hasattr(self, '_status') else ("error" if not self.success else "success")
    
    @status.setter
    def status(self, value: str):
        """Status setter"""
        self._status = value
    
    @classmethod
    def success_response(cls, data: T) -> 'DaoResponse[T]':
        """Create a success response"""
        return cls(success=True, data=data, status="success")
    
    @classmethod
    def error_response(cls, error_code: str, error_message: str) -> 'DaoResponse[T]':
        """Create an error response"""
        return cls(success=False, error_code=error_code, error_message=error_message, status="error")
    
    def is_success(self) -> bool:
        """Check if the response is successful"""
        return self.success
    
    def get_data(self) -> Optional[T]:
        """Get the response data"""
        return self.data
    
    def get_error(self) -> Optional[Tuple[str, str]]:
        """Get error code and message"""
        if not self.success:
            return (self.error_code, self.error_message)
        return None
    
    @classmethod
    def success_response_with_message(cls, operation: str, data: Any, *args) -> 'DaoResponse':
        """Create a success response with operation message (for backward compatibility)"""
        return cls(success=True, data=data, status="success")

