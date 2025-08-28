package com.business.controllers;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.Date;
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
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;

import com.business.basiclogics.Logic;
import com.business.entities.Admin;
import com.business.entities.Orders;
import com.business.entities.Product;
import com.business.entities.User;
import com.business.loginCredentials.AdminLogin;
import com.business.loginCredentials.UserLogin;
import com.business.services.AdminServices;
import com.business.services.OrderServices;
import com.business.services.ProductServices;
import com.business.services.UserServices;

@ExtendWith(MockitoExtension.class)
public class AdminControllerTest {

    @Mock
    private UserServices services;
    @Mock
    private AdminServices adminServices;
    @Mock
    private ProductServices productServices;
    @Mock
    private OrderServices orderServices;
    @Mock
    private Model model;
    @Mock
    private BindingResult bindingResult; // Added for completeness, though not directly used
    @InjectMocks
    private AdminController controller;
    @Captor
    private ArgumentCaptor<Admin> adminCaptor;
    @Captor
    private ArgumentCaptor<Orders> orderCaptor;
    @Captor
    private ArgumentCaptor<User> userCaptor;


    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUname("TestUser");
        user.setUid(1);
    }


    @Nested
    @DisplayName("getAllData Tests")
    class GetAllDataTests {
        @Test
        void should_RedirectToAdminServices_When_CredentialsAreValid() {
            when(adminServices.validateAdminCredentials(anyString(), anyString())).thenReturn(true);
            String result = controller.getAllData(new AdminLogin("test@example.com", "password"), model);
            assertEquals("redirect:/admin/services", result);
        }

        @Test
        void should_ReturnLoginWithErrorMessage_When_CredentialsAreInvalid() {
            when(adminServices.validateAdminCredentials(anyString(), anyString())).thenReturn(false);
            String result = controller.getAllData(new AdminLogin("test@example.com", "password"), model);
            assertEquals("Login", result);
            verify(model).addAttribute("error", "Invalid email or password");
        }
    }

    @Nested
    @DisplayName("userLogin Tests")
    class UserLoginTests {
        @Test
        void should_RedirectToBuyProduct_When_CredentialsAreValid() {
            when(services.validateLoginCredentials(anyString(), anyString())).thenReturn(true);
            when(services.getUserByEmail(anyString())).thenReturn(user);
            List<Orders> orders = new ArrayList<>();
            when(orderServices.getOrdersForUser(any(User.class))).thenReturn(orders);

            String result = controller.userLogin(new UserLogin("test@example.com", "password"), model);
            assertEquals("BuyProduct", result);
            verify(model).addAttribute("orders", orders);
            verify(model).addAttribute("name", user.getUname());
        }

        @Test
        void should_ReturnLoginWithErrorMessage_When_CredentialsAreInvalid() {
            when(services.validateLoginCredentials(anyString(), anyString())).thenReturn(false);
            String result = controller.userLogin(new UserLogin("test@example.com", "password"), model);
            assertEquals("Login", result);
            verify(model).addAttribute("error2", "Invalid email or password");

        }
    }


    @Nested
    @DisplayName("seachHandler Tests")
    class SearchHandlerTests {
        @Test
        void should_ReturnBuyProductWithMessage_When_ProductIsNotFound() {
            when(productServices.getProductByName(anyString())).thenReturn(null);
            List<Orders> orders = new ArrayList<>();
            when(orderServices.getOrdersForUser(any(User.class))).thenReturn(orders);
            String result = controller.seachHandler("NonExistentProduct", model);
            assertEquals("BuyProduct", result);
            verify(model).addAttribute("message", "SORRY...!  Product Unavailable");
            verify(model).addAttribute("product", null);
            verify(model).addAttribute("orders", orders);

        }

        @Test
        void should_ReturnBuyProductWithProduct_When_ProductIsFound() {
            Product product = new Product();
            product.setProductName("TestProduct");
            when(productServices.getProductByName(anyString())).thenReturn(product);
            List<Orders> orders = new ArrayList<>();
            when(orderServices.getOrdersForUser(any(User.class))).thenReturn(orders);
            String result = controller.seachHandler("TestProduct", model);
            assertEquals("BuyProduct", result);
            verify(model).addAttribute("product", product);
            verify(model).addAttribute("orders", orders);

        }
    }

    // ... (Tests for other methods follow a similar pattern) ...

    @Test
    void addAdmin_shouldAddAdminAndRedirect() {
        Admin admin = new Admin();
        controller.addAdmin(admin);
        verify(adminServices).addAdmin(admin);
    }

    @Test
    void updateAdmin_shouldUpdateAdminAndRedirect() {
        Admin admin = new Admin();
        admin.setAdminId(1);
        controller.updateAdmin(admin, 1);
        verify(adminServices).update(admin, 1);
    }

    @Test
    void deleteAdmin_shouldDeleteAdminAndRedirect() {
        controller.deleteAdmin(1);
        verify(adminServices).delete(anyInt());
    }


    @Test
    void orderHandler_shouldSaveOrderAndRedirect() {
        Orders order = new Orders();
        order.setoPrice(10.0);
        order.setoQuantity(2);
        controller.orderHandler(order, model);
        verify(orderServices).saveOrder(orderCaptor.capture());
        Orders capturedOrder = orderCaptor.getValue();
        assertEquals(20.0, capturedOrder.getTotalAmmout());
        assertNotNull(capturedOrder.getOrderDate());
        verify(model).addAttribute("amount", 20.0);

    }


    @Test
    void back_shouldReturnBuyProductWithOrders() {
        List<Orders> orders = new ArrayList<>();
        when(orderServices.getOrdersForUser(any(User.class))).thenReturn(orders);
        controller.back(model);
        verify(model).addAttribute("orders", orders);

    }

}