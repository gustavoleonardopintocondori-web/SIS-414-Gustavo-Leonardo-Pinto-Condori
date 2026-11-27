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
 @Bean OpenAPI api(){return new OpenAPI().info(new Info().title("V.S.I.A.F. - Sistema de Activos Fijos").version("Demo 0.3")
 .description("Replica academica independiente. Datos ficticios en H2, se reinician con el servidor. Solo unidadadmin tiene estructura DBF observada; otros campos son propuestas. Login demo/demo para probar escrituras. No usar datos institucionales."))
 .components(new Components().addSecuritySchemes("demoBearer",new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer")));}
}
