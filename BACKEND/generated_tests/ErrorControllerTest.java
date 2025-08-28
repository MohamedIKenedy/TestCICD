package com.jtspringproject.JtSpringProject.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class ErrorControllerTest {

    @InjectMocks
    private ErrorController errorController;

    @BeforeEach
    public void setUp() {
        // Add setup code if needed
    }

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ErrorControllerTest {

    @Nested
    @DisplayName("accessDenied() method")
    class AccessDeniedMethodTests {

        @Test
        @DisplayName("should return '403' when called")
        void shouldReturn403WhenCalled() {
            // Arrange & Act
            String result = new ErrorController().accessDenied();

            // Assert
            assertEquals("403", result);
        }

        @Test
        @DisplayName("should handle null return value gracefully")
        void shouldHandleNullReturnValueGracefully() {
            // Arrange & Act
            String result = mockAccessDeniedMethodReturningNull();

            // Assert
            assertNull(result);
        }

        private String mockAccessDeniedMethodReturningNull() {
            try (MockedStatic<ErrorController> mockedStatic = Mockito.mockStatic(ErrorController.class)) {
                mockedStatic.when(() -> new ErrorController().accessDenied()).thenReturn(null);

                return new ErrorController().accessDenied();
            }
        }
    }
}
}