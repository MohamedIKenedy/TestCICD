package com.dtechideas.restapitesting;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;

class TestingSpringBootRestApiApplicationTest {

    private TestingSpringBootRestApiApplication testingSpringBootRestApiApplication;

    @BeforeEach
    void setUp() {
        testingSpringBootRestApiApplication = new TestingSpringBootRestApiApplication();
    }

    @ParameterizedTest
    @CsvSource({
            "valid arguments",
            "empty array"
    })
    void main(String[] args) {
        // Typical use case: Start the Spring Boot application with valid arguments.
        testingSpringBootRestApiApplication.main(args);
    }

    @ParameterizedTest
    @CsvSource({
            "invalid arguments"
    })
    void main_withInvalidArguments(String[] args) {
        // Edge and boundary conditions: Start the Spring Boot application with invalid arguments (e.g., empty array).
        assertThrows(IllegalArgumentException.class, () -> testingSpringBootRestApiApplication.main(args));
    }

    @ParameterizedTest
    @CsvSource({
            "invalid arguments"
    })
    void main_withInvalidArgumentsAndExceptions(String[] args) {
        // Invalid input and exception handling: Start the Spring Boot application with invalid arguments that cause exceptions to be thrown.
        assertThrows(IllegalArgumentException.class, () -> testingSpringBootRestApiApplication.main(args));
    }
}