package ar.dev.jofrelautaro.reservation_backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
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
    // Importante: Asegurate de tener importado java.util.Map y java.util.HashMap
    
    public String subirArchivo(MultipartFile file) {
        try {
            Map<String, Object> options = new HashMap<>();
            // 👇 ESTO ES LA MAGIA: Le dice a Cloudinary que acepte PDFs, ZIPs, etc.
            options.put("resource_type", "auto"); 
            options.put("folder", "entregas_lms"); // Opcional: te crea una carpeta en tu cuenta

            Map<?, ?> uploadedFile = cloudinary.uploader().upload(file.getBytes(), options);
            return uploadedFile.get("secure_url").toString();
            
        } catch (Exception e) {
            throw new RuntimeException("Error al subir el archivo a Cloudinary: " + e.getMessage());
        }
    }
}