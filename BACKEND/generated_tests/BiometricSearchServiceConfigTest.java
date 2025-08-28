package com.idemia.mbis.businessapi.biometricsearch;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class BiometricSearchServiceConfigTest {

    @Mock
    private ConfigMapVolume configMapVolume;

    private BiometricSearchServiceConfig biometricSearchServiceConfig;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        biometricSearchServiceConfig = new BiometricSearchServiceConfig();
        // Initialize the instance with mock dependencies if necessary
    }

    @Test
    public void testGetInstance_ShouldReturnSameInstance() {
        assertNotNull(BiometricSearchServiceConfig.getInstance());
        assertEquals(BiometricSearchServiceConfig.getInstance(), BiometricSearchServiceConfig.getInstance());
    }

    // Add more tests for other methods as needed...
}