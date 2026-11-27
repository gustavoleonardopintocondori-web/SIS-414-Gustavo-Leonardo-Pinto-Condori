package bo.edu.vsiaf;
import java.util.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.media.Schema;
@RestController
@RequestMapping("/api/grupos-contables")
@Tag(name="Catálogos de demostración")
public class GrupoContableController {
 private static final String R="grupos-contables";
 private final Store store;
 public GrupoContableController(Store store){this.store=store;}
 @Schema(description="Campos provisionales de demostración; no son el esquema DBF oficial")
 public record Datos(@NotBlank String codigo, @NotBlank String descripcion, @Positive Integer vidaUtil){}
 @GetMapping @Operation(summary="GrupoContable - Listar")
 public List<Map<String,Object>> listar(){return store.list(R);}
 @GetMapping("/{id}") @Operation(summary="GrupoContable - Obtener por id")
 public Map<String,Object> obtener(@PathVariable("id") long id){return store.find(R,id);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) @SecurityRequirement(name="demoBearer") @Operation(summary="GrupoContable - Nuevo")
 public Map<String,Object> crear(@Valid @RequestBody Datos data){return store.create(R,data);}
 @PutMapping("/{id}") @SecurityRequirement(name="demoBearer") @Operation(summary="GrupoContable - Modificar")
 public Map<String,Object> modificar(@PathVariable("id") long id,@Valid @RequestBody Datos data){return store.update(R,id,data);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @SecurityRequirement(name="demoBearer") @Operation(summary="GrupoContable - Eliminar (demo)")
 public void eliminar(@PathVariable("id") long id){store.delete(R,id);}
 
}
