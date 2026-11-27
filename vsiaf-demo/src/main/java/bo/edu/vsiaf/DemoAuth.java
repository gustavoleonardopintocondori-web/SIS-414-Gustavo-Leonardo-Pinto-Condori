package bo.edu.vsiaf;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import java.io.IOException;
@Component
class DemoAuth extends OncePerRequestFilter {
 private final Map<String,Long> tokens=new ConcurrentHashMap<>();
 synchronized String login(String user,String pass){
  if(!"demo".equals(user)||!"demo".equals(pass)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Credenciales demo incorrectas");
  long now=System.currentTimeMillis(); tokens.values().removeIf(x->x<now);
  if(tokens.size()>=1000)throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Limite de sesiones de demo");
  String token=UUID.randomUUID().toString();tokens.put(token,now+3600000);return token;
 }
 @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
  String path=req.getRequestURI();String method=req.getMethod();
  if(path.startsWith("/api/")&&!path.equals("/api/auth/login")&&!Set.of("GET","HEAD","OPTIONS").contains(method)){
   String h=req.getHeader("Authorization");
   if(h==null||!h.startsWith("Bearer ")||tokens.getOrDefault(h.substring(7),0L)<System.currentTimeMillis()){
    res.setStatus(401);res.setContentType("application/json");res.getWriter().write("{\"error\":\"Inicie sesion demo y use Authorize\"}");return;
   }
  }chain.doFilter(req,res);
 }
}
@RestController @Tag(name="Iniciar sesión",description="Acceso exclusivo a la demostracion. Credenciales publicas demo/demo.")
class LoginController {
 private final DemoAuth auth; LoginController(DemoAuth auth){this.auth=auth;}
 record Credenciales(String usuario,String password){}
 @PostMapping("/api/auth/login") @Operation(summary="Iniciar sesión de demostración")
 Map<String,Object> login(@RequestBody Credenciales c){return Map.of("token",auth.login(c.usuario(),c.password()),"tokenType","Bearer","expiresIn",3600);}
 @GetMapping("/api/health") @Operation(summary="Estado del servicio")
 Map<String,String> health(){return Map.of("status","UP","modo","demo");}
}
