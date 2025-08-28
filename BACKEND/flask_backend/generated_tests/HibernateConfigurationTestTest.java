package com.jtspringproject.JtSpringProject;

import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

public class HibernateConfigurationTest {
    @Mock
    private DataSource dataSource;

    @Captor
    private ArgumentCaptor<DataSource> dataSourceArgumentCaptor;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.initMocks(this);
    }

    @ParameterizedTest
    @CsvSource({
            "com.mysql.cj.jdbc.Driver, jdbc:mysql://localhost/test, root, password",
            "org.postgresql.Driver, jdbc:postgresql://localhost/test, postgres, password"
    })
    void testDataSource(String driverClassName, String url, String username, String password) {
        // Arrange
        HibernateConfiguration configuration = new HibernateConfiguration();

        // Act
        DataSource actualDataSource = configuration.dataSource();

        // Assert
        assertEquals(driverClassName, actualDataSource.getDriverClassName());
        assertEquals(url, actualDataSource.getUrl());
        assertEquals(username, actualDataSource.getUsername());
        assertEquals(password, actualDataSource.getPassword());
    }

    @ParameterizedTest
    @CsvSource({
            "com.mysql.cj.jdbc.Driver, jdbc:mysql://localhost/test, root, password",
            "org.postgresql.Driver, jdbc:postgresql://localhost/test, postgres, password"
    })
    void testSessionFactory(String driverClassName, String url, String username, String password) {
        // Arrange
        HibernateConfiguration configuration = new HibernateConfiguration();

        // Act
        LocalSessionFactoryBean actualSessionFactory = configuration.sessionFactory();

        // Assert
        assertEquals(driverClassName, actualSessionFactory.getDataSource().getDriverClassName());
        assertEquals(url, actualSessionFactory.getDataSource().getUrl());
        assertEquals(username, actualSessionFactory.getDataSource().getUsername());
        assertEquals(password, actualSessionFactory.getDataSource().getPassword());
    }

    @ParameterizedTest
    @CsvSource({
            "com.mysql.cj.jdbc.Driver, jdbc:mysql://localhost/test, root, password",
            "org.postgresql.Driver, jdbc:postgresql://localhost/test, postgres, password"
    })
    void testTransactionManager(String driverClassName, String url, String username, String password) {
        // Arrange
        HibernateConfiguration configuration = new HibernateConfiguration();

        // Act
        HibernateTransactionManager actualTransactionManager = configuration.transactionManager();

        // Assert
        assertEquals(driverClassName, actualTransactionManager.getSessionFactory().getDataSource().getDriverClassName());
        assertEquals(url, actualTransactionManager.getSessionFactory().getDataSource().getUrl());
        assertEquals(username, actualTransactionManager.getSessionFactory().getDataSource().getUsername());
        assertEquals(password, actualTransactionManager.getSessionFactory().getDataSource().getPassword());
    }

    @Nested
    class WhenDataSourceIsConfigured {

        @Test
        void shouldReturnConfiguredDataSource() {
            // Arrange
            HibernateConfiguration configuration = new HibernateConfiguration();

            // Act
            DataSource actualDataSource = configuration.dataSource();

            // Assert
            verify(dataSource).getDriverClassName();
            verify(dataSource).getUrl();
            verify(dataSource).getUsername();
            verify(dataSource).getPassword();
        }
    }
}