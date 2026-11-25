package ar.dev.jofrelautaro.reservation_backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RateLimitInterceptorTest {

    private final RateLimitInterceptor interceptor = new RateLimitInterceptor();

    private MockHttpServletRequest peticionDesde(String ipReal, String forwardedFor) {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr(ipReal);
        if (forwardedFor != null) request.addHeader("X-Forwarded-For", forwardedFor);
        return request;
    }

    @Test
    void permiteCincoIntentosYBloqueaElSexto() throws Exception {
        for (int i = 0; i < 5; i++) {
            assertTrue(interceptor.preHandle(peticionDesde("203.0.113.10", null), new MockHttpServletResponse(), new Object()));
        }
        MockHttpServletResponse respuesta = new MockHttpServletResponse();
        assertFalse(interceptor.preHandle(peticionDesde("203.0.113.10", null), respuesta, new Object()));
        assertEquals(429, respuesta.getStatus());
    }

    @Test
    void falsificarXForwardedForNoPermiteSaltarseElLimite() throws Exception {
        for (int i = 0; i < 5; i++) {
            assertTrue(interceptor.preHandle(peticionDesde("203.0.113.20", "9.9.9." + i), new MockHttpServletResponse(), new Object()));
        }
        // Mismo cliente real, otro valor inventado en el header: debe seguir bloqueado
        MockHttpServletResponse respuesta = new MockHttpServletResponse();
        assertFalse(interceptor.preHandle(peticionDesde("203.0.113.20", "8.8.8.8"), respuesta, new Object()));
        assertEquals(429, respuesta.getStatus());
    }

    @Test
    void clientesDistintosTienenLimitesIndependientes() throws Exception {
        for (int i = 0; i < 5; i++) {
            interceptor.preHandle(peticionDesde("203.0.113.30", null), new MockHttpServletResponse(), new Object());
        }
        assertTrue(interceptor.preHandle(peticionDesde("203.0.113.31", null), new MockHttpServletResponse(), new Object()));
    }
}
