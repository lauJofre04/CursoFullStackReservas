package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.auth.AuthResponse;
import ar.dev.jofrelautaro.reservation_backend.auth.LoginRequest;
import ar.dev.jofrelautaro.reservation_backend.auth.RegisterRequest;
import ar.dev.jofrelautaro.reservation_backend.model.entity.TokenRecuperacion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.TokenVerificacion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;
import ar.dev.jofrelautaro.reservation_backend.repository.TokenRecuperacionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.TokenVerificacionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;
import ar.dev.jofrelautaro.reservation_backend.security.JwtService;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final TokenRecuperacionRepository tokenRecuperacionRepository;
    private final EmailService emailService;
    private final TokenVerificacionRepository tokenVerificacionRepository;

    public AuthResponse register(RegisterRequest request) {
        // 1. Creamos el usuario asegurándonos de que nazca bloqueado
        Usuario user = Usuario.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(request.getRol())
                .activo(true)
                .emailVerificado(false) // <- ¡IMPORTANTE! Nace sin verificar
                .build();
        
        // 2. Lo guardamos en la base de datos UNA sola vez (tu código lo guardaba dos veces sin querer)
        Usuario nuevoUsuario = repository.save(user);

        // 3. --- LÓGICA DE VERIFICACIÓN (Generar token y guardar) ---
        String token = java.util.UUID.randomUUID().toString();
        TokenVerificacion tokenVerificacion = TokenVerificacion.builder()
                .token(token)
                .usuario(nuevoUsuario)
                .fechaExpiracion(java.time.LocalDateTime.now().plusHours(24)) // 24 hs para verificar
                .build();
        tokenVerificacionRepository.save(tokenVerificacion);

        // 4. Disparamos el correo
        String linkReact = "https://devcursos-lj.vercel.app/verificar-cuenta?token=" + token;
        String cuerpoMail = "¡Bienvenido a DevCursos, " + nuevoUsuario.getNombre() + "!\n\n" +
                "Por favor, verificá tu correo haciendo clic en el siguiente enlace:\n\n" +
                linkReact + "\n\n" +
                "Si no te registraste, ignorá este correo.";

        emailService.enviarCorreoSimple(nuevoUsuario.getEmail(), "Verificá tu cuenta en DevCursos", cuerpoMail);
        
        // 5. Generamos el token JWT inicial
        var jwtToken = jwtService.generateToken(nuevoUsuario);
        return AuthResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // 1. Buscamos al usuario primero para ver si existe (antes de que Spring verifique la clave)
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas"));

        // 2. EL CANDADO: Si no verificó el mail, lo rebotamos acá mismo
        // Usamos Boolean.TRUE.equals para evitar NullPointerExceptions con usuarios viejos
        if (!Boolean.TRUE.equals(user.getEmailVerificado())) {
            throw new RuntimeException("Tenés que verificar tu correo electrónico antes de iniciar sesión. Revisá tu bandeja de entrada.");
        }

        // 3. Si está verificado, dejamos que Spring Security valide la contraseña
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        // 4. Si la contraseña es correcta, le damos su pase VIP
        var jwtToken = jwtService.generateToken(user);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .build();
    }
    // MÉTODO 1: Generar el token y mandar el mail
    public void solicitarRecuperacionPassword(String email) {
        Usuario usuario = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No existe un usuario con ese correo"));

        // Generamos los datos nuevos
        String tokenGenerado = java.util.UUID.randomUUID().toString();
        java.time.LocalDateTime expiracion = java.time.LocalDateTime.now().plusMinutes(15);

        // Buscamos si ya tiene un token en la base de datos
        Optional<TokenRecuperacion> tokenExistente = tokenRecuperacionRepository.findByUsuario(usuario);
        
        TokenRecuperacion miToken;
        if (tokenExistente.isPresent()) {
            // SI YA TIENE: Lo actualizamos (pisamos el viejo)
            miToken = tokenExistente.get();
            miToken.setToken(tokenGenerado);
            miToken.setFechaExpiracion(expiracion);
        } else {
            // SI NO TIENE: Creamos uno nuevito
            miToken = TokenRecuperacion.builder()
                    .token(tokenGenerado)
                    .usuario(usuario)
                    .fechaExpiracion(expiracion)
                    .build();
        }
        
        // Guardamos (esto hace un UPDATE o un INSERT automáticamente según corresponda)
        tokenRecuperacionRepository.save(miToken);

        // Armamos el link y enviamos
        String linkReact = "https://devcursos-lj.vercel.app/recuperar-password?token=" + tokenGenerado;

        String cuerpoMail = "Hola,\n\n" +
                "Recibimos una solicitud para cambiar tu contraseña en DevCursos.\n" +
                "Hacé clic en el siguiente enlace para crear una nueva (este link es válido por 15 minutos):\n\n" +
                linkReact + "\n\n" +
                "Si no fuiste vos, ignorá este mensaje.";

        emailService.enviarCorreoSimple(usuario.getEmail(), "Recuperación de Contraseña", cuerpoMail);
    }

    // MÉTODO 2: Validar el token y pisar la contraseña vieja
    public void cambiarPassword(String token, String nuevaPassword) {
        // Buscamos si el token existe
        TokenRecuperacion tokenDB = tokenRecuperacionRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("El link es inválido o no existe."));

        // Verificamos si ya pasaron los 15 minutos
        if (tokenDB.getFechaExpiracion().isBefore(java.time.LocalDateTime.now())) {
            tokenRecuperacionRepository.delete(tokenDB); // Lo borramos por inútil
            throw new RuntimeException("El link ha expirado. Volvé a solicitar uno nuevo.");
        }

        // Si está todo OK, le cambiamos la clave al usuario
        Usuario usuario = tokenDB.getUsuario();
        usuario.setPassword(passwordEncoder.encode(nuevaPassword)); // ¡Siempre hasheada!
        repository.save(usuario);

        // Borramos el token para que no lo puedan volver a usar
        tokenRecuperacionRepository.delete(tokenDB);
    }
    public void verificarCuenta(String token) {
        TokenVerificacion tokenDB = tokenVerificacionRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("El link de verificación es inválido o no existe."));

        if (tokenDB.getFechaExpiracion().isBefore(java.time.LocalDateTime.now())) {
            tokenVerificacionRepository.delete(tokenDB);
            throw new RuntimeException("El link ha expirado. Volvé a registrarte o solicitá uno nuevo.");
        }

        // Si está todo bien, le damos el check verde al usuario
        Usuario usuario = tokenDB.getUsuario();
        usuario.setEmailVerificado(true);
        repository.save(usuario);

        // Borramos el token usado
        tokenVerificacionRepository.delete(tokenDB);
    }
    public void reenviarCorreoVerificacion(String email) {
        // 1. Buscamos al usuario
        Usuario usuario = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No existe un usuario con ese correo"));

        // 2. Verificamos que no esté verificado ya (no queremos mandar mails de más)
        if (Boolean.TRUE.equals(usuario.getEmailVerificado())) {
            throw new RuntimeException("Este correo ya se encuentra verificado. Podés iniciar sesión.");
        }

        // 3. Generamos los datos del nuevo token
        String nuevoToken = java.util.UUID.randomUUID().toString();
        java.time.LocalDateTime expiracion = java.time.LocalDateTime.now().plusHours(24);

        // 4. Buscamos si ya tenía un token de verificación trabado y lo actualizamos (o creamos uno nuevo)
        java.util.Optional<TokenVerificacion> tokenExistente = tokenVerificacionRepository.findByUsuario(usuario);
        
        TokenVerificacion tokenParaGuardar;
        if (tokenExistente.isPresent()) {
            tokenParaGuardar = tokenExistente.get();
            tokenParaGuardar.setToken(nuevoToken);
            tokenParaGuardar.setFechaExpiracion(expiracion);
        } else {
            tokenParaGuardar = TokenVerificacion.builder()
                    .token(nuevoToken)
                    .usuario(usuario)
                    .fechaExpiracion(expiracion)
                    .build();
        }
        
        tokenVerificacionRepository.save(tokenParaGuardar);

        // 5. Disparamos el correo
        String linkReact = "https://devcursos-lj.vercel.app/verificar-cuenta?token=" + nuevoToken;
        String cuerpoMail = "¡Hola " + usuario.getNombre() + "!\n\n" +
                "Solicitaste un nuevo enlace para verificar tu cuenta en DevCursos.\n" +
                "Hacé clic en el siguiente enlace:\n\n" +
                linkReact + "\n\n" +
                "Si no fuiste vos, ignorá este mensaje.";

        emailService.enviarCorreoSimple(usuario.getEmail(), "Nuevo enlace de verificación - DevCursos", cuerpoMail);
    }
}