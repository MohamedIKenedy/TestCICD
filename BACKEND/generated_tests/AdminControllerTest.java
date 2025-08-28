package com.jtspringproject.JtSpringProject.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import java.util.List;

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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.ui.Model;
import org.springframework.web.servlet.ModelAndView;

import com.jtspringproject.JtSpringProject.models.Category;
import com.jtspringproject.JtSpringProject.models.Product;
import com.jtspringproject.JtSpringProject.models.User;
import com.jtspringproject.JtSpringProject.services.categoryService;
import com.jtspringproject.JtSpringProject.services.productService;
import com.jtspringproject.JtSpringProject.services.userService;

@ExtendWith(MockitoExtension.class)
public class AdminControllerTest {

    @Mock
    private userService userService;
    
    @Mock
    private categoryService categoryService;
    
    @Mock
    private productService productService;
    
    @InjectMocks
    private AdminController adminController;
    
    @Captor
    private ArgumentCaptor<String> stringArgumentCaptor;
    
    @BeforeEach
    public void setUp() {
        // Setup any necessary data or mocks here
    }

    @Nested
    @DisplayName("index method tests")
    class IndexMethodTests {

        @Test
        public void shouldReturnIndexViewWithUsernameAttribute() {
            String username = "testUser";
            
            given(userService.getCurrentUsername()).willReturn(username);
            
            ModelAndView modelAndView = adminController.index();
            
            assertEquals("index", modelAndView.getViewName());
            verify(modelAndView.getModelMap()).containsEntry("username", username);
        }
    }

    // Add similar test classes for other public methods following the same structure
}