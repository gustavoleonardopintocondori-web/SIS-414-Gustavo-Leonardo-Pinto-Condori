package bo.edu.vsiaf;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
@SpringBootApplication
public class Application {
 public static void main(String[] args){SpringApplication.run(Application.class,args);}
 @Bean OpenAPI api(){return new OpenAPI().info(new Info().title("V.S.I.A.F. - Sistema de Activos Fijos").version("Demo 0.4")
 .description("Réplica académica independiente con datos ficticios temporales. Para registrar: abra Iniciar sesión, pulse Try it out y Execute con demo/demo. Copie token en Authorize, sin escribir Bearer. Después abra POST, pulse Try it out, edite el JSON y Execute. Solo unidadadmin tiene estructura DBF observada; las demás reglas son provisionales. No usar datos institucionales."))
 .components(new Components().addSecuritySchemes("demoBearer",new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer")));}
}
