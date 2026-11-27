package bo.edu.vsiaf;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Catálogos auxiliares que completan la navegación de la demostración.
 *
 * IMPORTANTE: estos recursos se almacenan en demo_records (H2 en memoria).
 * No sustituyen las tablas DBF/SQL Server originales. La migración a las
 * tablas institucionales requiere el DDL oficial y sus claves compuestas.
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Catálogos complementarios", description = "Recursos auxiliares de la demostración vSIAF")
public class CatalogosController {
    private static final Set<String> RESOURCES = Set.of(
        "configuraciones",
        "cuentas-partidas",
        "data",
        "departamentos",
        "estructuras-entidad",
        "objetos-gasto",
        "reportes",
        "usuarios",
        "localizacion-bd",
        "generar-reportes"
    );

    private final Store store;

    public CatalogosController(Store store) {
        this.store = store;
    }

    private String resource(String name) {
        if (!RESOURCES.contains(name)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Módulo no disponible: " + name);
        }
        return name;
    }

    private void validateBody(Map<String, Object> body) {
        if (body == null || body.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe enviar al menos un campo.");
        }
    }

    @GetMapping("/{resource}")
    @Operation(summary = "Listar catálogo complementario")
    public List<Map<String, Object>> list(@PathVariable String resource) {
        String key = resource(resource);
        if ("localizacion-bd".equals(key) && store.list(key).isEmpty()) {
            return List.of(Map.of(
                "id", 1,
                "motor", "H2 (demostración)",
                "estado", "CONECTADO",
                "persistencia", "Temporal en memoria",
                "url", "vsiaf-api-l7ws.onrender.com"
            ));
        }
        return store.list(key);
    }

    @GetMapping("/{resource}/{id}")
    @Operation(summary = "Consultar registro de catálogo por identificador")
    public Map<String, Object> get(@PathVariable String resource, @PathVariable long id) {
        return store.find(resource(resource), id);
    }

    @PostMapping("/{resource}")
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear registro de catálogo")
    public Map<String, Object> create(@PathVariable String resource, @RequestBody Map<String, Object> body) {
        validateBody(body);
        return store.create(resource(resource), body);
    }

    @PutMapping("/{resource}/{id}")
    @Operation(summary = "Modificar registro de catálogo")
    public Map<String, Object> update(@PathVariable String resource, @PathVariable long id,
                                     @RequestBody Map<String, Object> body) {
        validateBody(body);
        return store.update(resource(resource), id, body);
    }

    @DeleteMapping("/{resource}/{id}")
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar registro de catálogo")
    public void delete(@PathVariable String resource, @PathVariable long id) {
        store.delete(resource(resource), id);
    }

    @GetMapping("/sistema/contexto")
    @Operation(summary = "Datos de cabecera del sistema")
    public Map<String, Object> contexto() {
        return Map.of(
            "entidad", Map.of("codigo", "DEMO", "nombre", "Entidad de demostración"),
            "unidad", Map.of("codigo", "DEMO", "nombre", "Unidad de demostración"),
            "backups", store.list("respaldos").size()
        );
    }

    @GetMapping("/sistema/acerca")
    @Operation(summary = "Información de la aplicación")
    public Map<String, Object> acerca() {
        return Map.of(
            "nombre", "vSIAF - Sistema de Activos Fijos",
            "version", "Réplica académica de demostración",
            "modo", "DEMO",
            "persistencia", "H2 en memoria"
        );
    }
}
