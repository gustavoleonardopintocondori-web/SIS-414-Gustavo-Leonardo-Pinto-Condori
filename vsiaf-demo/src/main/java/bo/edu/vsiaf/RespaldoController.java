package bo.edu.vsiaf;
import java.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
@RestController @RequestMapping("/api/respaldos") @Tag(name="Respaldos BD",description="Respaldos de datos ficticios de la demo, no de la base oficial")
public class RespaldoController {
 private final Store store;private final UnidadController unidades;
 public RespaldoController(Store store,UnidadController unidades){this.store=store;this.unidades=unidades;}
 public record Nombre(String nombre){}
 @GetMapping @Operation(summary="Respaldo - Listar") public List<Map<String,Object>> listar(){return store.list("respaldos");}
 @GetMapping("/{id}") @Operation(summary="Respaldo - Obtener por id") public Map<String,Object> obtener(@PathVariable("id") long id){return store.find("respaldos",id);}
 @PostMapping({"/respaldar",""}) @ResponseStatus(HttpStatus.CREATED) @SecurityRequirement(name="demoBearer") @Operation(summary="Respaldar datos de demostración")
 public Map<String,Object> respaldar(@RequestBody Nombre n){
  Map<String,Object> datos=new LinkedHashMap<>();
  for(String r:List.of("activos-fijos","transferencias","revalorizaciones","organismos-financiadores","motivos-baja","meses","estados","bajas","entidades","org-user","oficinas","responsables","grupos-contables","auxiliares"))datos.put(r,store.list(r));
  datos.put("unidades-admin",unidades.listar());
  return store.create("respaldos",Map.of("nombre",n.nombre()==null?"Respaldo demo":n.nombre(),"fecha",java.time.Instant.now().toString(),"datos",datos));
 }
 @PostMapping("/{id}/copiar-a") @SecurityRequirement(name="demoBearer") @Operation(summary="Exportar copia JSON de respaldo")
 public Map<String,Object> exportar(@PathVariable("id") long id){return obtener(id);}
 @PutMapping("/{id}") @SecurityRequirement(name="demoBearer") @Operation(summary="Respaldo - Modificar nombre")
 public Map<String,Object> modificar(@PathVariable("id") long id,@RequestBody Nombre n){Map<String,Object> m=obtener(id);m.remove("id");m.put("nombre",n.nombre());return store.update("respaldos",id,m);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @SecurityRequirement(name="demoBearer") @Operation(summary="Respaldo - Eliminar")
 public void eliminar(@PathVariable("id") long id){store.delete("respaldos",id);}
}
