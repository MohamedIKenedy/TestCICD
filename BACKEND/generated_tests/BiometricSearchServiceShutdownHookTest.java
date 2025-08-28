package com.idemia.mbis.businessapi.biometricsearch;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.slf4j.Logger;
import com.networknt.server.ShutdownHookProvider;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

public class BiometricSearchServiceShutdownHookTest {

    @Mock
    private Logger logger;

    private BiometricSearchServiceShutdownHook shutdownHook;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        shutdownHook = new BiometricSearchServiceShutdownHook();
        shutdownHook.logger = logger;
    }

    @Test
    public void testOnShutdown_shouldCallLoggerInfo() {
        // Act
        shutdownHook.onShutdown();

        // Assert
        verify(logger).info("Shutting down BiometricSearchService...");
    }
}