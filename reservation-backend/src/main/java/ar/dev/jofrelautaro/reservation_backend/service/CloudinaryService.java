package ar.dev.jofrelautaro.reservation_backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;
    
    // Método original (usa carpeta "usuarios" por defecto)
    public Map<String, Object> upload(MultipartFile multipartFile) throws IOException {
        // Subimos el archivo a la carpeta "usuarios" y forzamos el tipo de dato
        return upload(multipartFile, "usuarios");
    }

    // Método sobrecargado que acepta la carpeta como parámetro
    public Map<String, Object> upload(MultipartFile multipartFile, String folder) throws IOException {
        // Subimos el archivo a la carpeta especificada
        return (Map<String, Object>) cloudinary.uploader().upload(multipartFile.getBytes(), 
                ObjectUtils.asMap("folder", folder));
    }
}