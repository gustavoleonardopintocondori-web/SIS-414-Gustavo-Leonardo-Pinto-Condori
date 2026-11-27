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
@RequestMapping("/api/meses")
@Tag(name="Activos Fijos")
public class MesController {
 private static final String R="meses";
 private final Store store;
 public MesController(Store store){this.store=store;}
 @Schema(description="Campos provisionales de demostración; no son el esquema DBF oficial")
 public record Datos(@NotNull @Min(1) @Max(12) Integer numero, @NotBlank String nombre){}
 @GetMapping @Operation(summary="Mes - Listar")
 public List<Map<String,Object>> listar(){return store.list(R);}
 @GetMapping("/{id}") @Operation(summary="Mes - Obtener por id")
 public Map<String,Object> obtener(@PathVariable("id") long id){return store.find(R,id);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) @SecurityRequirement(name="demoBearer") @Operation(summary="Mes - Nuevo")
 public Map<String,Object> crear(@Valid @RequestBody Datos data){return store.create(R,data);}
 @PutMapping("/{id}") @SecurityRequirement(name="demoBearer") @Operation(summary="Mes - Modificar")
 public Map<String,Object> modificar(@PathVariable("id") long id,@Valid @RequestBody Datos data){return store.update(R,id,data);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @SecurityRequirement(name="demoBearer") @Operation(summary="Mes - Eliminar (demo)")
 public void eliminar(@PathVariable("id") long id){store.delete(R,id);}
 
}
