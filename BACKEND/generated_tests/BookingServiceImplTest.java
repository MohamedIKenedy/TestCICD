package com.shashi.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
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

import com.shashi.beans.HistoryBean;
import com.shashi.beans.TrainException;
import com.shashi.utility.DBUtil;

@ExtendWith(MockitoExtension.class)
public class BookingServiceImplTest {

    @Mock
    private DBUtil dbUtil;

    @Mock
    private Connection connection;

    @Mock
    private PreparedStatement preparedStatement;

    @Mock
    private ResultSet resultSet;

    @InjectMocks
    private BookingServiceImpl bookingService;

    @Captor
    private ArgumentCaptor<String> stringArgumentCaptor;

    @BeforeEach
    void setUp() throws SQLException {
        when(dbUtil.getConnection()).thenReturn(connection);
    }

    @Nested
    @DisplayName("getAllBookingsByCustomerId method tests")
    class GetAllBookingsByCustomerIdTests {

        @Test
        @DisplayName("Should return empty list when no bookings found for customer email id")
        void shouldReturnEmptyListWhenNoBookingsFound() throws SQLException, TrainException {
            // Given
            String customerEmailId = "test@example.com";
            when(connection.prepareStatement(anyString())).thenReturn(preparedStatement);
            when(preparedStatement.executeQuery()).thenReturn(resultSet);
            when(resultSet.next()).thenReturn(false);

            // When
            List<HistoryBean> bookings = bookingService.getAllBookingsByCustomerId(customerEmailId);

            // Then
            assertEquals(0, bookings.size());
        }

        @Test
        @DisplayName("Should return list of bookings for customer email id")
        void shouldReturnListOfBookingsForCustomer() throws SQLException, TrainException {
            // Given
            String customerEmailId = "test@example.com";
            when(connection.prepareStatement(anyString())).thenReturn(preparedStatement);
            when(preparedStatement.executeQuery()).thenReturn(resultSet);
            when(resultSet.next()).thenReturn(true).thenReturn(false);

            HistoryBean historyBean1 = new HistoryBean();
            // Set values for historyBean1...

            HistoryBean historyBean2 = new HistoryBean();
            // Set values for historyBean2...

            List<HistoryBean> expectedBookings = new ArrayList<>();
            expectedBookings.add(historyBean1);
            expectedBookings.add(historyBean2);

            when(resultSet.getString("transid")).thenReturn(historyBean1.getTransId(), historyBean2.getTransId());
            // Set values for other fields...

            // When
            List<HistoryBean> bookings = bookingService.getAllBookingsByCustomerId(customerEmailId);

            // Then
            assertEquals(expectedBookings, bookings);
        }
    }

    @Nested
    @DisplayName("createHistory method tests")
    class CreateHistoryTests {

        @Test
        @DisplayName("Should create history and return it when successful")
        void shouldCreateHistoryAndReturnIt() throws SQLException, TrainException {
            // Given
            HistoryBean details = new HistoryBean();
            // Set values for details...

            String transactionId = "1234567890";
            when(connection.prepareStatement(anyString())).thenReturn(preparedStatement);
            when(preparedStatement.executeUpdate()).thenReturn(1);
            when(preparedStatement.setString(anyInt(), anyString())).thenReturn(null);
            when(preparedStatement.setLong(anyInt(), anyLong())).thenReturn(null);
            when(preparedStatement.setDouble(anyInt(), anyDouble())).thenReturn(null);

            HistoryBean expectedHistory = new HistoryBean();
            // Set values for expectedHistory...
            expectedHistory.setTransId(transactionId);

            // When
            HistoryBean history = bookingService.createHistory(details);

            // Then
            assertEquals(expectedHistory, history);
        }

        @Test
        @DisplayName("Should throw TrainException when database operation fails")
        void shouldThrowTrainExceptionWhenDatabaseOperationFails() throws SQLException, TrainException {
            // Given
            HistoryBean details = new HistoryBean();
            // Set values for details...

            when(connection.prepareStatement(anyString())).thenReturn(preparedStatement);
            when(preparedStatement.executeUpdate()).thenThrow(new SQLException());

            // When & Then
            assertThrows(TrainException.class, () -> bookingService.createHistory(details));
        }
    }
}