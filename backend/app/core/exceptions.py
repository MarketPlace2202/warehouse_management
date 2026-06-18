class AppException(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message=message, status_code=404)


class ConflictException(AppException):
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(message=message, status_code=409)


class InsufficientStockException(AppException):
    def __init__(self, message: str = "Insufficient stock"):
        super().__init__(message=message, status_code=400)


class ValidationException(AppException):
    def __init__(self, message: str = "Validation error"):
        super().__init__(message=message, status_code=422)
