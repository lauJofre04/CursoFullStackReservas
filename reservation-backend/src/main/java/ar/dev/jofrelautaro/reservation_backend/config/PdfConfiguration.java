package ar.dev.jofrelautaro.reservation_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

@Configuration
public class PdfConfiguration {

    @Bean
    public TemplateEngine pdfTemplateEngine() {
        SpringTemplateEngine templateEngine = new SpringTemplateEngine();
        templateEngine.setTemplateResolver(pdfTemplateResolver());
        return templateEngine;
    }

    private ClassLoaderTemplateResolver pdfTemplateResolver() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/"); // Carpeta base
        resolver.setSuffix(".html"); // Extensión
        resolver.setTemplateMode(TemplateMode.HTML); // Modo HTML
        resolver.setCharacterEncoding("UTF-8");
        resolver.setOrder(1);
        return resolver;
    }
}