import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MbssServiceProxyTest {

    @Mock
    private SoapMbssProxy soapMbssProxy;

    @Mock
    private MbssResponseHandler mbssResponseHandler;

    @Mock
    private ApiResponseBuilder apiResponseBuilder;

    @Mock
    private HandlerUtils handlerUtils;

    @Mock
    private ApiErrorHandler apiErrorHandler;

    @InjectMocks
    private MbssServiceProxy mbssServiceProxy;

    @Captor
    ArgumentCaptor<AuthenticatePersonRequest> authenticatePersonRequestArgumentCaptor;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Nested
    class AuthenticatePersonTest {

        @Test
        void should_SendRequestAndHandleSuccessfully_When_ValidInput() {
            // Given: Arrange test data and mock behaviors
            String request = UUID.randomUUID().toString() + "_AuthentPerson";
            Person person = new Person();
            List<String> refIdList = Arrays.asList("ref1", "ref2");
            AuthenticatePersonRequest authenticatePersonRequest = buildAuthenticatePersonRequest(request, person, 0, refIdList);

            MbssResponse response = new MbssResponse();
            when(soapMbssProxy.sendRequest(authenticatePersonRequest)).thenReturn(response);

            PersonAuthenticationResults expectedResult = new PersonAuthenticationResults();
            when(apiResponseBuilder.buildApiResponseFromMbssAutenticateResponse(response.getAuthenticatePersonResponse(), any(), anyString(), anyString())).thenReturn(expectedResult);

            String jsonResponse = "{\"key\":\"value\"}";
            when(handlerUtils.convertObjectToJSON(any(), any())).thenReturn(jsonResponse);

            // When: Execute the method under test
            mbssServiceProxy.authenticatePerson();

            // Then: Assert results and verify interactions
            verify(soapMbssProxy).sendRequest(authenticatePersonRequestArgumentCaptor.capture());
            assertEquals(authenticatePersonRequest, authenticatePersonRequestArgumentCaptor.getValue());

            verify(mbssResponseHandler).handleAuthenticatePersonResponse(response);
            verify(apiResponseBuilder).buildApiResponseFromMbssAutenticateResponse(response.getAuthenticatePersonResponse(), any(), anyString(), anyString());
            verify(handlerUtils).convertObjectToJSON(any(), expectedResult);
            verify(handlerUtils).sendSuccessReply(any(), jsonResponse);
        }

        @Test
        void should_HandleErrorResponse_When_ApiErrorOccurs() {
            // Given: Setup invalid condition
            when(soapMbssProxy.sendRequest(any())).thenReturn(null);

            // When  & Then: Use assertThrows
            Exception exception = assertThrows(RuntimeException.class, () -> {
                mbssServiceProxy.authenticatePerson();
            });
            assertEquals("Error message", exception.getMessage());
        }
    }

    private AuthenticatePersonRequest buildAuthenticatePersonRequest(String request, Person person, int retryCount, List<String> refIdList) {
        // Implement the logic to create and return an AuthenticatePersonRequest object based on input parameters
        return new AuthenticatePersonRequest();  // Replace with actual implementation
    }
}