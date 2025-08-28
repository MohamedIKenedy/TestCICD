package com.business.controllers;

import com.business.entities.Product;
import com.business.loginCredentials.AdminLogin;
import com.business.services.ProductServices;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ui.Model;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class HomeControllerTest {

    @Mock
    private ProductServices productServices;

    @InjectMocks
    private HomeController homeController;

    @Nested
    class HomeTests {
        @Test
        void should_returnHomeView_When_homeIsCalled() {
            assertEquals("Home", homeController.home());
        }
    }

    @Nested
    class ProductsTests {
        @Test
        void should_returnProductsViewWithProducts_When_productsIsCalledAndProductsExist() {
            List<Product> products = List.of(new Product(1L, "Product 1", 10.0));
            when(productServices.getAllProducts()).thenReturn(products);

            Model model = mock(Model.class);
            String viewName = homeController.products(model);

            assertEquals("Products", viewName);
            verify(model).addAttribute("products", products);
        }

        @Test
        void should_returnProductsViewWithEmptyList_When_productsIsCalledAndNoProductsExist() {
            when(productServices.getAllProducts()).thenReturn(Collections.emptyList());

            Model model = mock(Model.class);
            String viewName = homeController.products(model);

            assertEquals("Products", viewName);
            verify(model).addAttribute("products", Collections.emptyList());
        }

        @Test
        void should_handleNullPointerException_when_productServicesReturnsNull(){
            when(productServices.getAllProducts()).thenReturn(null);
            Model model = mock(Model.class);
            String viewName = homeController.products(model);
            assertEquals("Products",viewName);
            verify(model).addAttribute("products", null);

        }
    }

    @Nested
    class LocationTests {
        @Test
        void should_returnLocationView_When_locationIsCalled() {
            assertEquals("Locate_us", homeController.location());
        }
    }

    @Nested
    class AboutTests {
        @Test
        void should_returnAboutView_When_aboutIsCalled() {
            assertEquals("About", homeController.about());
        }
    }

    @Nested
    class LoginTests {
        @Test
        void should_returnLoginViewWithAdminLoginObject_When_loginIsCalled() {
            Model model = mock(Model.class);
            String viewName = homeController.login(model);

            assertEquals("Login", viewName);
            ArgumentCaptor<AdminLogin> adminLoginCaptor = ArgumentCaptor.forClass(AdminLogin.class);
            verify(model).addAttribute(eq("adminLogin"), adminLoginCaptor.capture());
            assertNotNull(adminLoginCaptor.getValue());
        }
    }
}