package com.jtspringproject.JtSpringProject;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.hibernate5.HibernateTransactionManager;
import org.springframework.orm.hibernate5.LocalSessionFactoryBean;

import javax.sql.DataSource;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = HibernateConfiguration.class)
public class HibernateConfigurationTest {

    @Autowired
    private HibernateConfiguration hibernateConfiguration;

    @BeforeEach
    public void setUp() {
        // Initialize the properties for testing
        hibernateConfiguration.setDriver("com.mysql.cj.jdbc.Driver");
        hibernateConfiguration.setPassword("password");
        hibernateConfiguration.setUrl("jdbc:mysql://localhost:3306/testdb");
        hibernateConfiguration.setUsername("root");
        hibernateConfiguration.setDialect("org.hibernate.dialect.MySQL5InnoDBDialect");
        hibernateConfiguration.setShowSql("true");
        hibernateConfiguration.setHbm2ddlAuto("update");
        hibernateConfiguration.setPackagesToScan("com.jtspringproject.JtSpringProject");
    }

    @Test
    public void testDataSource() {
        DataSource dataSource = hibernateConfiguration.dataSource();
        assertNotNull(dataSource);
        assertTrue(dataSource instanceof DriverManagerDataSource);
        assertEquals("com.mysql.cj.jdbc.Driver", ((DriverManagerDataSource) dataSource).getDriverClassName());
        assertEquals("password", ((DriverManagerDataSource) dataSource).getPassword());
        assertEquals("jdbc:mysql://localhost:3306/testdb", ((DriverManagerDataSource) dataSource).getUrl());
        assertEquals("root", ((DriverManagerDataSource) dataSource).getUsername());
    }

    @Test
    public void testSessionFactory() {
        LocalSessionFactoryBean sessionFactory = hibernateConfiguration.sessionFactory();
        assertNotNull(sessionFactory);
        Properties properties = new Properties();
        properties.setProperty("hibernate.dialect", "org.hibernate.dialect.MySQL5InnoDBDialect");
        properties.setProperty("hibernate.show_sql", "true");
        properties.setProperty("hibernate.hbm2ddl.auto", "update");
        assertEquals(properties, sessionFactory.getHibernateProperties());
    }

    @Test
    public void testTransactionManager() {
        HibernateTransactionManager transactionManager = hibernateConfiguration.transactionManager();
        assertNotNull(transactionManager);
        assertNotNull(transactionManager.getSessionFactory());
    }
}