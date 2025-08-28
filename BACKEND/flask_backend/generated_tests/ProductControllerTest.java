package com.example.demo.controllers;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.entities.Product;
import com.example.demo.services.ProductServices;

@ExtendWith(MockitoExtension.class)
public class ProductControllerTest {

    @Mock
    private ProductServices productServices;

    @InjectMocks
    private ProductController productController;

    @Nested
    class AddProductTests {
        @Test
        void should_addProduct_When_validProduct() {
            Product product = new Product();
            product.setPid(1);
            product.setPname("Test Product");
            product.setPprice(10.0);
            product.setPdescription("Test Description");

            String result = productController.addProduct(product);
            assertEquals("redirect:/admin/services", result);
            verify(productServices).addProduct(product);
        }

        @Test
        void should_notThrowException_When_nullProduct() {
            assertDoesNotThrow(() -> productController.addProduct(null));
            verify(productServices, never()).addProduct(any());
        }
    }


    @Nested
    class UpdateProductTests {
        @Test
        void should_updateProduct_When_validProductAndId() {
            Product product = new Product();
            product.setPid(1);
            product.setPname("Updated Product");
            product.setPprice(20.0);
            product.setPdescription("Updated Description");
            int id = 1;

            String result = productController.updateProduct(product, id);
            assertEquals("redirect:/admin/services", result);
            verify(productServices).updateproduct(product, id);
        }

        @Test
        void should_notThrowException_When_invalidId() {
            Product product = new Product();
            int id = -1;
            assertDoesNotThrow(() -> productController.updateProduct(product, id));
            verify(productServices).updateproduct(product, id);

        }

        @Test
        void should_notThrowException_When_nullProduct() {
            int id = 1;
            assertDoesNotThrow(() -> productController.updateProduct(null, id));
            verify(productServices, never()).updateproduct(any(), anyInt());
        }
    }

    @Nested
    class DeleteProductTests {
        @Test
        void should_deleteProduct_When_validId() {
            int id = 1;
            String result = productController.delete(id);
            assertEquals("redirect:/admin/services", result);
            verify(productServices).deleteProduct(id);
        }

        @Test
        void should_notThrowException_When_invalidId() {
            int id = -1;
            assertDoesNotThrow(() -> productController.delete(id));
            verify(productServices).deleteProduct(id);
        }
    }
}