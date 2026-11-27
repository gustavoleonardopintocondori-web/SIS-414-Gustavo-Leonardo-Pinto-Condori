package bo.edu.vsiaf;
import java.util.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
@RestController @RequestMapping("/api/unidades-admin")
@Tag(name="Administrar Unidad",description="Campos observados en unidadadmin.DBF. ID compuesto provisional ENTIDAD~UNIDAD.")
public class UnidadController {
 private final JdbcTemplate jdbc;public UnidadController(JdbcTemplate jdbc){this.jdbc=jdbc;}
 public record Datos(@JsonProperty("ENTIDAD") @NotBlank @Size(max=4) @Pattern(regexp="[^~/]+") String entidad,
 @JsonProperty("UNIDAD") @NotBlank @Size(max=5) @Pattern(regexp="[^~/]+") String unidad,
 @JsonProperty("DESCRIP") @Size(max=120) String descrip,@JsonProperty("CIUDAD") @Size(max=20) String ciudad,
 @JsonProperty("ESTADOUNI") @NotNull @Min(0) @Max(9) Integer estado){}
 private String[] key(String id){String[] k=id.split("~",-1);if(k.length!=2||k[0].isBlank()||k[1].isBlank())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Formato ENTIDAD~UNIDAD");return k;}
 private Map<String,Object> row(Map<String,Object> m){Map<String,Object> a=new LinkedHashMap<>(m);a.put("id",m.get("ENTIDAD")+"~"+m.get("UNIDAD"));return a;}
 @GetMapping @Operation(summary="UnidadAdmin - Listar")
 public List<Map<String,Object>> listar(){return jdbc.queryForList("SELECT ENTIDAD,UNIDAD,DESCRIP,CIUDAD,ESTADOUNI FROM unidadadmin ORDER BY ENTIDAD,UNIDAD").stream().map(this::row).toList();}
 @GetMapping("/{id}") @Operation(summary="UnidadAdmin - Obtener por id")
 public Map<String,Object> obtener(@PathVariable("id") String id){String[] k=key(id);return jdbc.queryForList("SELECT * FROM unidadadmin WHERE ENTIDAD=? AND UNIDAD=?",k[0],k[1]).stream().map(this::row).findFirst().orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) @SecurityRequirement(name="demoBearer") @Operation(summary="UnidadAdmin - Nuevo")
 public synchronized Map<String,Object> crear(@Valid @RequestBody Datos d){
  if(listar().size()>=500)throw new ResponseStatusException(HttpStatus.CONFLICT,"Limite demo");
  try{jdbc.update("INSERT INTO unidadadmin VALUES(?,?,?,?,?)",d.entidad(),d.unidad(),d.descrip(),d.ciudad(),d.estado());}catch(DataIntegrityViolationException e){throw new ResponseStatusException(HttpStatus.CONFLICT,"Clave duplicada o datos invalidos");}
  return obtener(d.entidad()+"~"+d.unidad());
 }
 @PutMapping("/{id}") @SecurityRequirement(name="demoBearer") @Operation(summary="UnidadAdmin - Modificar")
 public Map<String,Object> modificar(@PathVariable("id") String id,@Valid @RequestBody Datos d){String[] k=key(id);if(!k[0].equals(d.entidad())||!k[1].equals(d.unidad()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"No se modifica la clave");if(jdbc.update("UPDATE unidadadmin SET DESCRIP=?,CIUDAD=?,ESTADOUNI=? WHERE ENTIDAD=? AND UNIDAD=?",d.descrip(),d.ciudad(),d.estado(),k[0],k[1])==0)throw new ResponseStatusException(HttpStatus.NOT_FOUND);return obtener(id);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @SecurityRequirement(name="demoBearer") @Operation(summary="UnidadAdmin - Eliminar")
 public void eliminar(@PathVariable("id") String id){String[] k=key(id);if(jdbc.update("DELETE FROM unidadadmin WHERE ENTIDAD=? AND UNIDAD=?",k[0],k[1])==0)throw new ResponseStatusException(HttpStatus.NOT_FOUND);}
 @GetMapping("/{id}/seleccionar") @Operation(summary="Seleccionar unidad")
 public Map<String,Object> seleccionar(@PathVariable("id") String id){return obtener(id);}
}
