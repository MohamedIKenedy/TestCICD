package com.dtechideas.restapitesting;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TestingSpringBootRestApiApplication {
    @BeforeEach
    public void setUp() throws Exception {
        SpringApplication springApplication = new SpringApplication();
    }

    @ParameterizedTest
    @ValueSource(strings = {"", " ", null})
    public void main_shouldThrowIllegalArgumentExceptionIfArgsIsNullOrEmpty(String[] args) {
        // Given
        TestingSpringBootRestApiApplication application = new TestingSpringBootRestApiApplication();

        // When
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            SpringApplication.run(TestingSpringBootRestApiApplication.class, args);
        });

        // Then
        String expectedMessage = "The main method must not be null";
        assertEquals(expectedMessage, exception.getMessage());
    }
}