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
    void usaLaUltimaEntradaDeXForwardedForQueAgregaElProxy() throws Exception {
        // IP de Cloudflare como remoteAddr; el cliente real llega al final del header
        for (int i = 0; i < 5; i++) {
            assertTrue(interceptor.preHandle(peticionDesde("172.69.34.148", "200.126.178.200"), new MockHttpServletResponse(), new Object()));
        }
        // Otro usuario detrás de la MISMA IP de Cloudflare no queda bloqueado
        assertTrue(interceptor.preHandle(peticionDesde("172.69.34.148", "190.12.34.56"), new MockHttpServletResponse(), new Object()));
    }

    @Test
    void falsificarElInicioDeXForwardedForNoPermiteSaltarseElLimite() throws Exception {
        for (int i = 0; i < 5; i++) {
            // El atacante inventa una IP distinta a la izquierda; el proxy agrega la real al final
            assertTrue(interceptor.preHandle(peticionDesde("172.69.34.148", "9.9.9." + i + ", 203.0.113.20"), new MockHttpServletResponse(), new Object()));
        }
        MockHttpServletResponse respuesta = new MockHttpServletResponse();
        assertFalse(interceptor.preHandle(peticionDesde("172.69.34.148", "8.8.8.8, 203.0.113.20"), respuesta, new Object()));
        assertEquals(429, respuesta.getStatus());
    }

    @Test
    void siElHeaderNoEsUnaIpUsaRemoteAddr() throws Exception {
        for (int i = 0; i < 5; i++) {
            assertTrue(interceptor.preHandle(peticionDesde("203.0.113.40", "basura-<script>-" + i), new MockHttpServletResponse(), new Object()));
        }
        assertFalse(interceptor.preHandle(peticionDesde("203.0.113.40", "otra-basura"), new MockHttpServletResponse(), new Object()));
    }

    @Test
    void clientesDistintosTienenLimitesIndependientes() throws Exception {
        for (int i = 0; i < 5; i++) {
            interceptor.preHandle(peticionDesde("203.0.113.30", null), new MockHttpServletResponse(), new Object());
        }
        assertTrue(interceptor.preHandle(peticionDesde("203.0.113.31", null), new MockHttpServletResponse(), new Object()));
    }
}
