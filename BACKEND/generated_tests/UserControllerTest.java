package com.jtspringproject.JtSpringProject.controller;

import com.jtspringproject.JtSpringProject.models.*;
import com.jtspringproject.JtSpringProject.services.cartService;
import com.jtspringproject.JtSpringProject.services.productService;
import com.jtspringproject.JtSpringProject.services.userService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.ui.Model;
import org.springframework.web.servlet.ModelAndView;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    @Mock
    private userService userService;

    @Mock
    private productService productService;

    @InjectMocks
    private UserController userController;

    @Captor
    private ArgumentCaptor<User> userArgumentCaptor;

    private MockHttpServletRequest request;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.getContext().setAuthentication(mock(org.springframework.security.core.Authentication.class));
        request = new MockHttpServletRequest();
    }

    @Nested
    @DisplayName("registerUser method tests")
    class RegisterUserTests {

        @Test
        @DisplayName("should return 'register' view name")
        void shouldReturnRegisterViewName() {
            String result = userController.registerUser();

            assertEquals("register", result);
        }
    }

    // Add similar test classes for other methods...

    @Nested
    @DisplayName("newUseRegister method tests")
    class NewUserRegisterTests {

        @Test
        @DisplayName("should add new user when username does not exist in database")
        void shouldAddNewUserWhenUsernameDoesNotExist() {
            User newUser = new User(1, "testuser", "test@example.com", "password", "ROLE_NORMAL");

            given(userService.checkUserExists(newUser.getUsername())).willReturn(false);

            userController.newUseRegister(newUser);

            verify(userService).addUser(userArgumentCaptor.capture());
            User capturedUser = userArgumentCaptor.getValue();

            assertEquals(newUser.getUsername(), capturedUser.getUsername());
            assertEquals(newUser.getEmail(), capturedUser.getEmail());
            assertEquals(newUser.getPassword(), capturedUser.getPassword());
            assertEquals(newUser.getRole(), capturedUser.getRole());
        }

        @Test
        @DisplayName("should not add new user when username already exists in database")
        void shouldNotAddNewUserWhenUsernameExists() {
            User existingUser = new User(1, "existinguser", "existing@example.com", "password", "ROLE_NORMAL");

            given(userService.checkUserExists(existingUser.getUsername())).willReturn(true);

            userController.newUseRegister(existingUser);

            verify(userService, never()).addUser(any());
        }
    }

    // Add similar test classes for other methods...
}