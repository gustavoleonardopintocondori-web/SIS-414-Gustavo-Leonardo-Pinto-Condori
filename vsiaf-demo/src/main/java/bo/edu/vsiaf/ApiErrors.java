package bo.edu.vsiaf;
import java.util.*;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
@RestControllerAdvice
public class ApiErrors {
 @ExceptionHandler(MethodArgumentNotValidException.class)
 public ResponseEntity<Map<String,Object>> invalid(MethodArgumentNotValidException e){
  Map<String,String> campos=new LinkedHashMap<>();
  Map<String,String> dbf=Map.of("entidad","ENTIDAD","unidad","UNIDAD","descrip","DESCRIP","ciudad","CIUDAD","estado","ESTADOUNI");
  boolean unidad=e.getBindingResult().getTarget() instanceof UnidadController.Datos;
  for(var f:e.getBindingResult().getFieldErrors()){
   String name=unidad?dbf.getOrDefault(f.getField(),f.getField()):f.getField();
   String code=f.getCode()==null?"":f.getCode();
   String msg=switch(code){
    case "NotBlank","NotNull" -> "Campo obligatorio";
    case "Size" -> "Longitud fuera del límite permitido";
    case "Min","Max","Positive","PositiveOrZero" -> "Valor numérico fuera del rango permitido";
    case "Pattern" -> "Formato no permitido";
    default -> "Valor inválido";
   };
   campos.putIfAbsent(name,msg);
  }
  return ResponseEntity.badRequest().body(Map.of("status",400,"mensaje","Revise los datos ingresados","campos",campos));
 }
 @ExceptionHandler({HttpMessageNotReadableException.class,MethodArgumentTypeMismatchException.class})
 public ResponseEntity<Map<String,Object>> formato(Exception e){
  return ResponseEntity.badRequest().body(Map.of("status",400,"mensaje","Formato de datos inválido. Revise JSON, tipos de campos e identificador."));
 }
 @ExceptionHandler(ResponseStatusException.class)
 public ResponseEntity<Map<String,Object>> estado(ResponseStatusException e){
  int code=e.getStatusCode().value();String msg=e.getReason();
  if(msg==null)msg=code==404?"Registro no encontrado":code==401?"Debe iniciar sesión":"No se pudo realizar la operación";
  return ResponseEntity.status(e.getStatusCode()).body(Map.of("status",code,"mensaje",msg));
 }
}
