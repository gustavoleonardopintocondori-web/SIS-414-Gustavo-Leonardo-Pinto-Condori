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
@RequestMapping("/api/activos-fijos")
@Tag(name="Activos Fijos")
public class ActivoFijoController {
 private static final String R="activos-fijos";
 private final Store store;
 public ActivoFijoController(Store store){this.store=store;}
 @Schema(description="Campos provisionales de demostración; no son el esquema DBF oficial")
 public record Datos(@NotBlank String codigo, @NotBlank String descripcion, @PositiveOrZero java.math.BigDecimal valorAdquisicion, String fechaAdquisicion, Long estadoId, String unidadId){}
 @GetMapping @Operation(summary="ActivoFijo - Listar")
 public List<Map<String,Object>> listar(){return store.list(R);}
 @GetMapping("/{id}") @Operation(summary="ActivoFijo - Obtener por id")
 public Map<String,Object> obtener(@PathVariable("id") long id){return store.find(R,id);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) @SecurityRequirement(name="demoBearer") @Operation(summary="ActivoFijo - Nuevo")
 public Map<String,Object> crear(@Valid @RequestBody Datos data){return store.create(R,data);}
 @PutMapping("/{id}") @SecurityRequirement(name="demoBearer") @Operation(summary="ActivoFijo - Modificar")
 public Map<String,Object> modificar(@PathVariable("id") long id,@Valid @RequestBody Datos data){return store.update(R,id,data);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @SecurityRequirement(name="demoBearer") @Operation(summary="ActivoFijo - Eliminar (demo)")
 public void eliminar(@PathVariable("id") long id){store.delete(R,id);}
 
 @GetMapping("/{id}/ficha") @Operation(summary="Ficha del activo fijo (datos registrados)")
 public Map<String,Object> ficha(@PathVariable("id") long id){return store.find(R,id);}
 @GetMapping("/{id}/anterior") @Operation(summary="Anterior")
 public Map<String,Object> anterior(@PathVariable("id") long id){return store.list(R).stream().filter(x->((Number)x.get("id")).longValue()<id).reduce((a,b)->b).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"No hay anterior"));}
 @GetMapping("/{id}/siguiente") @Operation(summary="Siguiente")
 public Map<String,Object> siguiente(@PathVariable("id") long id){return store.list(R).stream().filter(x->((Number)x.get("id")).longValue()>id).findFirst().orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"No hay siguiente"));}
 @GetMapping("/primero") @Operation(summary="Primero")
 public Map<String,Object> primero(){return store.list(R).stream().findFirst().orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));}
 @GetMapping("/ultimo") @Operation(summary="Último")
 public Map<String,Object> ultimo(){return store.list(R).stream().reduce((a,b)->b).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));}
 @GetMapping("/buscar") @Operation(summary="Buscar por código o descripción")
 public List<Map<String,Object>> buscar(@RequestParam("texto") String texto){String t=texto.toLowerCase(Locale.ROOT);return store.list(R).stream().filter(x->String.valueOf(x.get("codigo")).toLowerCase(Locale.ROOT).contains(t)||String.valueOf(x.get("descripcion")).toLowerCase(Locale.ROOT).contains(t)).toList();}

}
