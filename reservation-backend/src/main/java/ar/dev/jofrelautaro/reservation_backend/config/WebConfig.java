package ar.dev.jofrelautaro.reservation_backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final RateLimitInterceptor rateLimitInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Le indicamos que vigile exclusivamente el endpoint de login
        // (Ajustá la ruta "/api/auth/login" si tu controlador usa otra distinta)
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/api/auth/login", "/auth/login"); 
    }
}