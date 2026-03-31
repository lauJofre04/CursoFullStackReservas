package ar.dev.jofrelautaro.reservation_backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import ar.dev.jofrelautaro.reservation_backend.model.dto.ActualizarPerfilRequest;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;
import ar.dev.jofrelautaro.reservation_backend.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import java.io.IOException;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin // Acordate del CORS para React
public class UsuarioController {

    private final CloudinaryService cloudinaryService;
    private final UsuarioRepository usuarioRepository;

    @PostMapping("/{id}/avatar")
    public ResponseEntity<Map<String, String>> subirAvatar(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws IOException {
        
        // 1. Buscamos al usuario
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Subimos a Cloudinary (con la etiqueta para silenciar el warning)
        Map<String, Object> result = (Map<String, Object>) cloudinaryService.upload(file);
        String urlFoto = result.get("url").toString();

        // 3. Guardamos la URL en la base de datos
        usuario.setFotoPerfilUrl(urlFoto);
        usuarioRepository.save(usuario);

        Map<String, String> response = new HashMap<>();
        response.put("url", urlFoto);
        response.put("mensaje", "Foto de perfil actualizada correctamente");
        
        return ResponseEntity.ok(response);
    }
    // IMPORTANTE: Asegurate de importar ActualizarPerfilRequest y LocalDate arriba
    
    @PutMapping("/{id}/perfil")
    public ResponseEntity<Map<String, String>> actualizarDatosPerfil(
            @PathVariable Long id, 
            @RequestBody ActualizarPerfilRequest request) {
        
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Actualizamos los datos (si vienen vacíos, se guardan vacíos)
        usuario.setBiografia(request.getBiografia());
        usuario.setTelefono(request.getTelefono());
        usuario.setFechaNacimiento(request.getFechaNacimiento());

        usuarioRepository.save(usuario);

        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "Datos personales actualizados correctamente");
        
        return ResponseEntity.ok(response);
    }
    @GetMapping("/{id}/perfil")
    public ResponseEntity<Map<String, Object>> obtenerPerfil(@PathVariable Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Armamos un mapita solo con los datos públicos/editables (¡nunca devolver el password!)
        Map<String, Object> perfil = new HashMap<>();
        perfil.put("nombre", usuario.getNombre());
        perfil.put("fotoPerfilUrl", usuario.getFotoPerfilUrl());
        perfil.put("biografia", usuario.getBiografia());
        perfil.put("telefono", usuario.getTelefono());
        perfil.put("fechaNacimiento", usuario.getFechaNacimiento());

        return ResponseEntity.ok(perfil);
    }
}