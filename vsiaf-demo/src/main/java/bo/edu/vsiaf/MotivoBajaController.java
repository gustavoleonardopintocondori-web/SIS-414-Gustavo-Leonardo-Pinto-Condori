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
@RequestMapping("/api/motivos-baja")
@Tag(name="Activos Fijos")
public class MotivoBajaController {
 private static final String R="motivos-baja";
 private final Store store;
 public MotivoBajaController(Store store){this.store=store;}
 @Schema(description="Campos provisionales de demostración; no son el esquema DBF oficial")
 public record Datos(@NotBlank String codigo, @NotBlank String descripcion){}
 @GetMapping @Operation(summary="MotivoBaja - Listar")
 public List<Map<String,Object>> listar(){return store.list(R);}
 @GetMapping("/{id}") @Operation(summary="MotivoBaja - Obtener por id")
 public Map<String,Object> obtener(@PathVariable("id") long id){return store.find(R,id);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) @SecurityRequirement(name="demoBearer") @Operation(summary="MotivoBaja - Nuevo")
 public Map<String,Object> crear(@Valid @RequestBody Datos data){return store.create(R,data);}
 @PutMapping("/{id}") @SecurityRequirement(name="demoBearer") @Operation(summary="MotivoBaja - Modificar")
 public Map<String,Object> modificar(@PathVariable("id") long id,@Valid @RequestBody Datos data){return store.update(R,id,data);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @SecurityRequirement(name="demoBearer") @Operation(summary="MotivoBaja - Eliminar (demo)")
 public void eliminar(@PathVariable("id") long id){store.delete(R,id);}
 
}
