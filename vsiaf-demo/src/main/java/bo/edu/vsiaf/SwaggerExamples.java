package bo.edu.vsiaf;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.*;
import org.springframework.context.annotation.*;
import org.springdoc.core.customizers.OpenApiCustomizer;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.responses.ApiResponse;
@Configuration
class SwaggerExamples {
 @Bean OpenApiCustomizer ejemplos(ObjectMapper mapper) throws com.fasterxml.jackson.core.JsonProcessingException {
  Map<String,JsonNode> ejemplos=new LinkedHashMap<>();
  ejemplos.put("/api/activos-fijos",mapper.readTree("{\"codigo\":\"AF01\",\"descripcion\":\"Computadora de prueba\",\"valorAdquisicion\":5500,\"fechaAdquisicion\":\"2026-01-15\"}"));
  ejemplos.put("/api/transferencias",mapper.readTree("{\"activoId\":1,\"unidadDestino\":\"DEMO~ADM\",\"fecha\":\"2026-11-27\",\"motivo\":\"Traslado de prueba\"}"));
  ejemplos.put("/api/revalorizaciones",mapper.readTree("{\"activoId\":1,\"nuevoValor\":6000,\"fecha\":\"2026-11-27\",\"motivo\":\"Ejemplo\"}"));
  ejemplos.put("/api/organismos-financiadores",mapper.readTree("{\"codigo\":\"OF01\",\"nombre\":\"Organismo demo\"}"));
  ejemplos.put("/api/motivos-baja",mapper.readTree("{\"codigo\":\"MB01\",\"descripcion\":\"Obsolescencia\"}"));
  ejemplos.put("/api/meses",mapper.readTree("{\"numero\":1,\"nombre\":\"Enero\"}"));
  ejemplos.put("/api/estados",mapper.readTree("{\"codigo\":\"B\",\"descripcion\":\"Bueno\"}"));
  ejemplos.put("/api/bajas",mapper.readTree("{\"activoId\":1,\"motivoId\":1,\"fecha\":\"2026-11-27\",\"observacion\":\"Ejemplo\"}"));
  ejemplos.put("/api/entidades",mapper.readTree("{\"codigo\":\"E01\",\"nombre\":\"Entidad de prueba\"}"));
  ejemplos.put("/api/org-user",mapper.readTree("{\"usuario\":\"demo2\",\"organizacion\":\"DEMO\",\"rol\":\"Consulta\"}"));
  ejemplos.put("/api/oficinas",mapper.readTree("{\"codigo\":\"O01\",\"nombre\":\"Oficina demo\",\"unidadId\":\"DEMO~ADM\"}"));
  ejemplos.put("/api/responsables",mapper.readTree("{\"codigo\":\"R01\",\"nombre\":\"Responsable demo\"}"));
  ejemplos.put("/api/grupos-contables",mapper.readTree("{\"codigo\":\"GC01\",\"descripcion\":\"Equipos\",\"vidaUtil\":4}"));
  ejemplos.put("/api/auxiliares",mapper.readTree("{\"codigo\":\"A01\",\"descripcion\":\"Auxiliar demo\",\"grupoId\":1}"));
  ejemplos.put("/api/unidades-admin",mapper.readTree("{\"ENTIDAD\":\"DEMO\",\"UNIDAD\":\"U02\",\"DESCRIP\":\"Unidad de prueba\",\"CIUDAD\":\"Potosi\",\"ESTADOUNI\":1}"));
  ejemplos.put("/api/auth/login",mapper.readTree("{\"usuario\":\"demo\",\"password\":\"demo\"}"));
  ejemplos.put("/api/respaldos",mapper.readTree("{\"nombre\":\"Respaldo de prueba\"}"));
  return api->api.getPaths().forEach((ruta,item)->{
   String base=ruta.replace("/{id}","");
   if(base.equals("/api/respaldos/respaldar"))base="/api/respaldos";
   final JsonNode ejemplo=ejemplos.get(base);
   item.readOperationsMap().forEach((metodo,op)->{
    boolean escritura=Set.of(PathItem.HttpMethod.POST,PathItem.HttpMethod.PUT,PathItem.HttpMethod.DELETE).contains(metodo);
    if(escritura)op.getResponses().addApiResponse("400",new ApiResponse().description("Datos inválidos o formato incorrecto"));
    if(escritura)op.getResponses().addApiResponse("401",new ApiResponse().description("Credenciales inválidas o sesión no autorizada"));
    if(ruta.contains("/{id}"))op.getResponses().addApiResponse("404",new ApiResponse().description("Registro no encontrado"));
    if(ruta.startsWith("/api/unidades-admin")&&escritura)op.getResponses().addApiResponse("409",new ApiResponse().description("Conflicto de datos"));
    if(ejemplo!=null&&op.getRequestBody()!=null&&op.getRequestBody().getContent()!=null){
     var media=op.getRequestBody().getContent().get("application/json");
     if(media!=null)media.setExample(mapper.convertValue(ejemplo,Object.class));
    }
   });
  });
 }
}
