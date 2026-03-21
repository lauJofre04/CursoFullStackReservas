package ar.dev.jofrelautaro.reservation_backend.exception;

import org.springframework.http.HttpStatus;

public class BusinessRuleViolationException extends RuntimeException {

    private final HttpStatus httpStatus;

    public BusinessRuleViolationException(String message) {
        this(message, HttpStatus.BAD_REQUEST);
    }

    public BusinessRuleViolationException(String message, HttpStatus httpStatus) {
        super(message);
        this.httpStatus = httpStatus;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
