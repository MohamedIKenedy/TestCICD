package com.dtechideas.restapitesting.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ResourceAlreadyExistsExceptionTest {
    private ResourceAlreadyExistsException exception;

    @BeforeEach
    public void setUp() {
        this.exception = new ResourceAlreadyExistsException("resourceName", "fieldName", "fieldValue");
    }

    @ParameterizedTest
    @CsvSource({
            "resourceName, fieldName, fieldValue",
            "null, null, null"
    })
    void getResourceName_shouldReturnExpected(String resourceName, String fieldName, String fieldValue) {
        // Arrange
        exception.setResourceName(resourceName);
        exception.setFieldName(fieldName);
        exception.setFieldValue(fieldValue);

        // Act
        String actual = exception.getResourceName();

        // Assert
        assertEquals(resourceName, actual);
    }

    @ParameterizedTest
    @CsvSource({
            "resourceName, fieldName, fieldValue",
            "null, null, null"
    })
    void getFieldName_shouldReturnExpected(String resourceName, String fieldName, String fieldValue) {
        // Arrange
        exception.setResourceName(resourceName);
        exception.setFieldName(fieldName);
        exception.setFieldValue(fieldValue);

        // Act
        String actual = exception.getFieldName();

        // Assert
        assertEquals(fieldName, actual);
    }

    @ParameterizedTest
    @CsvSource({
            "resourceName, fieldName, fieldValue",
            "null, null, null"
    })
    void getFieldValue_shouldReturnExpected(String resourceName, String fieldName, String fieldValue) {
        // Arrange
        exception.setResourceName(resourceName);
        exception.setFieldName(fieldName);
        exception.setFieldValue(fieldValue);

        // Act
        String actual = exception.getFieldValue();

        // Assert
        assertEquals(fieldValue, actual);
    }
}