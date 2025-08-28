import com.idemia.mbis.businessapi.biometricsearch.handler.SearchesAuthenticatePersonProcess;
import com.idemia.mbis.businessapi.exception.ApiErrorHandler;
import com.idemia.mbis.businessapi.exception.ApiStatusCodes;
import com.idemia.mbis.businessapi.mbss.proxy.MbssServiceProxyFactory;
import com.idemia.mbis.businessapi.mbsswsclient.*;
import io.undertow.server.HttpServerExchange;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.Logger;

import java.io.IOException;
import java.util.ArrayList;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SearchesAuthenticatePersonProcessTest {

    @Mock
    private Logger logger;

    @Mock
    private MbssServiceProxyFactory mbssServiceProxyFactory;

    @Mock
    private SoapMbssProxy soapMbssProxy;

    @Captor
    private ArgumentCaptor<Request> requestArgumentCaptor;

    @InjectMocks
    private SearchesAuthenticatePersonProcess searchesAuthenticatePersonProcess;

    @BeforeEach
    void setUp() {
        when(mbssServiceProxyFactory.getSoapMbssProxy()).thenReturn(soapMbssProxy);
    }

    @Nested
    @DisplayName("process method tests")
    class ProcessMethodTests {

        @Test
        @DisplayName("should call mbss proxy methods and handle successful responses")
        void shouldCallMbssProxyMethodsAndHandleSuccessfulResponses() throws IOException, ClientException {
            // Given: Arrange test data and mock behaviors
            String id = "123";
            int idType = 456;
            String pdjId = "pdj-123";
            boolean isJuvenile = false;

            FingerprintCaseItemList fingerprintCaseItemList = new FingerprintCaseItemList();
            SlapImageCaseItemList slapImageCaseItemList = new SlapImageCaseItemList();
            FaceCaseItemList faceCaseItemList = new FaceCaseItemList();
            IrisCaseItemList irisCaseItemList = new IrisCaseItemList();

            HttpServerExchange exchange = mock(HttpServerExchange.class);

            Person person = mock(Person.class);
            Response response = mock(Response.class);
            EncodePersonResponse encodePersonResponse = mock(EncodePersonResponse.class);
            AuthenticatePersonResponse authenticatePersonResponse = mock(AuthenticatePersonResponse.class);

            when(soapMbssProxy.sendRequest(any())).thenReturn(response);
            when(response.getEncodePersonResponse()).thenReturn(encodePersonResponse);
            when(encodePersonResponse.getPerson()).thenReturn(person);
            when(response.getAuthenticatePersonResponse()).thenReturn(authenticatePersonResponse);

            // When: Execute the method under test
            SearchesAuthenticatePersonProcess.process(id, idType, pdjId, isJuvenile, fingerprintCaseItemList, slapImageCaseItemList, faceCaseItemList, irisCaseItemList, exchange);

            // Then: Assert results and verify interactions
            verify(soapMbssProxy).sendRequest(requestArgumentCaptor.capture());
            Request request = requestArgumentCaptor.getValue();
            assertNotNull(request);
            assertEquals("EncodePerson", request.getOperationName());

            verify(soapMbssProxy).sendRequest(requestArgumentCaptor.capture());
            request = requestArgumentCaptor.getValue();
            assertNotNull(request);
            assertEquals("AuthenticatePerson", request.getOperationName());
        }

        @Test
        @DisplayName("should handle mbss encode person error")
        void shouldHandleMbssEncodePersonError() throws IOException, ClientException {
            // Given: Arrange test data and mock behaviors
            String id = "123";
            int idType = 456;
            String pdjId = "pdj-123";
            boolean isJuvenile = false;

            FingerprintCaseItemList fingerprintCaseItemList = new FingerprintCaseItemList();
            SlapImageCaseItemList slapImageCaseItemList = new SlapImageCaseItemList();
            FaceCaseItemList faceCaseItemList = new FaceCaseItemList();
            IrisCaseItemList irisCaseItemList = new IrisCaseItemList();

            HttpServerExchange exchange = mock(HttpServerExchange.class);

            Response response = mock(Response.class);
            EncodePersonResponse encodePersonResponse = mock(EncodePersonResponse.class);
            Error error = new Error("MBSS_ERROR", "Error message");

            when(soapMbssProxy.sendRequest(any())).thenReturn(response);
            when(response.getEncodePersonResponse()).thenReturn(encodePersonResponse);
            when(encodePersonResponse.getError()).thenReturn(error);

            // When: Execute the method under test
            SearchesAuthenticatePersonProcess.process(id, idType, pdjId, isJuvenile, fingerprintCaseItemList, slapImageCaseItemList, faceCaseItemList, irisCaseItemList, exchange);

            // Then: Assert results and verify interactions
            verify(apiErrorHandler).sendErrorReply(exchange, ApiStatusCodes.MBSS_DATA_RETRIEVAL_ERROR, error.getMessage());
        }

        @Test
        @DisplayName("should handle mbss authenticate person error")
        void shouldHandleMbssAuthenticatePersonError() throws IOException, ClientException {
            // Given: Arrange test data and mock behaviors
            String id = "123";
            int idType = 456;
            String pdjId = "pdj-123";
            boolean isJuvenile = false;

            FingerprintCaseItemList fingerprintCaseItemList = new FingerprintCaseItemList();
            SlapImageCaseItemList slapImageCaseItemList = new SlapImageCaseItemList();
            FaceCaseItemList faceCaseItemList = new FaceCaseItemList();
            IrisCaseItemList irisCaseItemList = new IrisCaseItemList();

            HttpServerExchange exchange = mock(HttpServerExchange.class);

            Person person = mock(Person.class);
            Response response = mock(Response.class);
            EncodePersonResponse encodePersonResponse = mock(EncodePersonResponse.class);
            AuthenticatePersonResponse authenticatePersonResponse = mock(AuthenticatePersonResponse.class);
            Error error = new Error("MBSS_ERROR", "Error message");

            when(soapMbssProxy.sendRequest(any())).thenReturn(response).thenReturn(response);
            when(response.getEncodePersonResponse()).thenReturn(encodePersonResponse);
            when(encodePersonResponse.getPerson()).thenReturn(person);
            when(response.getAuthenticatePersonResponse()).thenReturn(authenticatePersonResponse);
            when(authenticatePersonResponse.getError()).thenReturn(error);

            // When: Execute the method under test
            SearchesAuthenticatePersonProcess.process(id, idType, pdjId, isJuvenile, fingerprintCaseItemList, slapImageCaseItemList, faceCaseItemList, irisCaseItemList, exchange);

            // Then: Assert results and verify interactions
            verify(apiErrorHandler).sendErrorReply(exchange, ApiStatusCodes.MBSS_DATA_RETRIEVAL_ERROR, error.getMessage());
        }
    }
}