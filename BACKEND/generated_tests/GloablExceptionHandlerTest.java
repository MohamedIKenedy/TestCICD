package com.dtechideas.restapitesting.exception;

import java.time.Instant;
import java.util.Date;
import java.util.List;

import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoJUnitRunner;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.request.WebRequest;

import com.dtechideas.restapitesting.exception.ErrorDetail;
import com.dtechideas.restapitesting.exception.ResourceNotFoundException;
import com.dtechideas.restapitesting.exception.ResourceAlreadyExistsException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.BDDMockito.*;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class GloablExceptionHandlerTest {

    @InjectMocks
    private GloablExceptionHandler exceptionHandler;

    @Mock
    private WebRequest webRequest;

    @BeforeClass
    public void setup() {
        // Set up the mock dependencies
    }

    @BeforeEach
    public void setUp() {
        // Set up the mock dependencies
    }

    @Test
    public void testHandleResourceNotFoundException() {
        // Test with valid input and expect a ResponseEntity object with appropriate status code and error message.
        ResourceNotFoundException exception = new ResourceNotFoundException("Resource not found");
        ErrorDetail errorDetail = new ErrorDetail(new Date(), exception.getMessage(), webRequest.getDescription(false));
        ResponseEntity<ErrorDetail> responseEntity = exceptionHandler.handleResourceNotFoundException(exception, webRequest);
        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertNotNull(responseEntity.getHeaders());

        // Test with maximum and minimum values for the date and time fields of ErrorDetail class to ensure it handles edge cases.
        Instant maxDate = Instant.MAX;
        Instant minDate = Instant.MIN;
        errorDetail = new ErrorDetail(maxDate, exception.getMessage(), webRequest.getDescription(false));
        responseEntity = exceptionHandler.handleResourceNotFoundException(exception, webRequest);
        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertNotNull(responseEntity.getHeaders());

        errorDetail = new ErrorDetail(minDate, exception.getMessage(), webRequest.getDescription(false));
        responseEntity = exceptionHandler.handleResourceNotFoundException(exception, webRequest);
        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertNotNull(responseEntity.getHeaders());

        // Test by passing null or invalid input to the constructor of ErrorDetail class and check if the method throws an exception or not.
        errorDetail = new ErrorDetail(null, exception.getMessage(), webRequest.getDescription(false));
        assertThrowsException(NullPointerException.class, () -> {
            responseEntity = exceptionHandler.handleResourceNotFoundException(exception, webRequest);
        });

        errorDetail = new ErrorDetail("", exception.getMessage(), webRequest.getDescription(false));
        assertThrowsException(IllegalArgumentException.class, () -> {
            responseEntity = exceptionHandler.handleResourceNotFoundException(exception, webRequest);
        });
    }

    @Test
    public void testHandleResourceAlreadyExistsException() {
        // Test with valid input and expect a ResponseEntity object with appropriate status code and error message.
        ResourceAlreadyExistsException exception = new ResourceAlreadyExistsException("Resource already exists");
        ErrorDetail errorDetail = new ErrorDetail(new Date(), exception.getMessage(), webRequest.getDescription(false));
        ResponseEntity<ErrorDetail> responseEntity = exceptionHandler.handleResourceAlreadyExistsException(exception, webRequest);
        assertEquals(HttpStatus.CONFLICT, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertNotNull(responseEntity.getHeaders());

        // Test with maximum and minimum values for the date and time fields of ErrorDetail class to ensure it handles edge cases.
        Instant maxDate = Instant.MAX;
        Instant minDate = Instant.MIN;
        errorDetail = new ErrorDetail(maxDate, exception.getMessage(), webRequest.getDescription(false));
        responseEntity = exceptionHandler.handleResourceAlreadyExistsException(exception, webRequest);
        assertEquals(HttpStatus.CONFLICT, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertNotNull(responseEntity.getHeaders());

        errorDetail = new ErrorDetail(minDate, exception.getMessage(), webRequest.getDescription(false));
        responseEntity = exceptionHandler.handleResourceAlreadyExistsException(exception, webRequest);
        assertEquals(HttpStatus.CONFLICT, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertNotNull(responseEntity.getHeaders());

        // Test by passing null or invalid input to the constructor of ErrorDetail class and check if the method throws an exception or not.
        errorDetail = new ErrorDetail(null, exception.getMessage(), webRequest.getDescription(false));
        assertThrowsException(NullPointerException.class, () -> {
            responseEntity = exceptionHandler.handleResourceAlreadyExistsException(exception, webRequest);
        });

        errorDetail = new ErrorDetail("", exception.getMessage(), webRequest.getDescription(false));
        assertThrowsException(IllegalArgumentException.class, () -> {
            responseEntity = exceptionHandler.handleResourceAlreadyExistsException(exception, webRequest);
        });
    }
}