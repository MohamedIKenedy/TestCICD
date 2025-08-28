package com.example.demo.controllers;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.entities.Orders;
import com.example.demo.entities.User;
import com.example.demo.services.OrderServices;


@ExtendWith(MockitoExtension.class)
public class OrderControllerTest {

    @Mock
    private OrderServices orderServices;

    @InjectMocks
    private OrderController orderController;


    @Nested
    class GetOrdersTests {
        @Test
        void should_ReturnListOfOrders_When_GetOrdersCalled() {
            //Arrange
            List<Orders> orders = new ArrayList<>();
            Orders order1 = new Orders();
            order1.setoName("Order 1");
            order1.setoPrice(10.0);
            order1.setoQuantity(1);
            order1.setOrderDate(new Date());
            orders.add(order1);

            when(orderServices.getOrders()).thenReturn(orders);


            //Act
            //  No direct method to test in OrderController,  assuming a hypothetical getOrders method.
            //  Replace this with an actual method if present in the OrderController after adding it

            //Assert
            verify(orderServices).getOrders();

        }

        @Test
        void should_HandleEmptyOrdersList_When_GetOrdersCalled() {
            //Arrange
            when(orderServices.getOrders()).thenReturn(new ArrayList<>());

            //Act
            //  No direct method to test in OrderController,  assuming a hypothetical getOrders method.
            //  Replace this with an actual method if present in the OrderController after adding it

            //Assert
            verify(orderServices).getOrders();

        }
    }


    @Nested
    class SaveOrderTests {
        @Test
        void should_SaveOrder_When_SaveOrderCalled() {
            //Arrange
            Orders order = new Orders();
            order.setoName("Order 1");
            order.setoPrice(10.0);
            order.setoQuantity(1);
            order.setOrderDate(new Date());

            //Act
            //  No direct method to test in OrderController,  assuming a hypothetical saveOrder method.
            //  Replace this with an actual method if present in the OrderController after adding it

            //Assert
            ArgumentCaptor<Orders> orderCaptor = ArgumentCaptor.forClass(Orders.class);
            verify(orderServices).saveOrder(orderCaptor.capture());
            assertEquals("Order 1", orderCaptor.getValue().getoName());
        }
    }

    @Nested
    class UpdateOrderTests {
        @Test
        void should_UpdateOrder_When_UpdateOrderCalled() {
            //Arrange
            Orders order = new Orders();
            order.setoId(1);
            order.setoName("Updated Order");

            //Act
            // No direct method to test in OrderController. Assuming a hypothetical updateOrder method.
            // Replace this with an actual method if present in OrderController after adding it

            //Assert
            ArgumentCaptor<Orders> orderCaptor = ArgumentCaptor.forClass(Orders.class);
            verify(orderServices).updateOrder(1,orderCaptor.capture());
            assertEquals("Updated Order",orderCaptor.getValue().getoName());
        }
    }

    @Nested
    class DeleteOrderTests {
        @Test
        void should_DeleteOrder_When_DeleteOrderCalled() {
            //Arrange
            int orderId = 1;

            //Act
            // No direct method to test in OrderController.  Assuming a hypothetical deleteOrder method
            // Replace this with an actual method if present in the OrderController after adding it

            //Assert
            verify(orderServices).deleteOrder(orderId);
        }
    }

    @Nested
    class GetOrdersForUserTests {
        @Test
        void should_GetOrdersForUser_When_GetOrdersForUserCalled() {
            //Arrange
            User user = new User("test@example.com", "password");
            List<Orders> orders = new ArrayList<>();
            when(orderServices.getOrdersForUser(user)).thenReturn(orders);

            //Act
            // No direct method to test in OrderController. Assuming a hypothetical getOrdersForUser method.
            // Replace this with an actual method if present in the OrderController after adding it

            //Assert
            verify(orderServices).getOrdersForUser(user);
        }
    }
}