class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    errorStack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    // to falsify success flag
    this.success = false;
    // to pass down all errors
    this.errors = errors;

    // to get access of stack trace to get access of errors and their location
    if (errorStack) {
      this.errorStack = errorStack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
