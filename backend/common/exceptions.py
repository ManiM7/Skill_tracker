#customs errors
class ValidationError(Exception):
    pass

class AuthError(Exception):
    pass

class NotFoundError(Exception):
    pass

class ForbiddenError(Exception):
    pass
