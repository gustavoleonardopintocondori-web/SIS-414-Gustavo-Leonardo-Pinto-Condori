package bo.edu.vsiaf;
import java.nio.*;
import java.nio.charset.Charset;
import java.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
@RestController @RequestMapping("/api/importaciones") @Tag(name="Importaciones")
public class ImportController {
 private static final Charset CP=Charset.forName("windows-1252");
 record Campo(String nombre,String tipo,int longitud,int decimales){}
 @PostMapping(value="/dbf/preview",consumes="multipart/form-data") @SecurityRequirement(name="demoBearer")
 @Operation(summary="Previsualizar archivo DBF dBase III",description="Lee encabezados y hasta 10 filas activas; omite registros borrados. No importa ni guarda datos.")
 public Map<String,Object> preview(@RequestPart("file") MultipartFile file)throws java.io.IOException{
  if(file.isEmpty()||file.getSize()>2*1024*1024)throw bad();
  byte[] b=file.getBytes();if(b.length<33||(b[0]&255)!=3)throw bad();
  ByteBuffer q=ByteBuffer.wrap(b).order(ByteOrder.LITTLE_ENDIAN);
  long n=Integer.toUnsignedLong(q.getInt(4));int header=Short.toUnsignedInt(q.getShort(8)),len=Short.toUnsignedInt(q.getShort(10));
  if(header<33||header>b.length||len<1||n>100000||header+n*len>b.length||b[header-1]!=13||(header-33)%32!=0)throw bad();
  List<Campo> campos=new ArrayList<>();int total=1;
  for(int p=32;p<header-1;p+=32){int end=p;while(end<p+11&&b[end]!=0)end++;String name=new String(b,p,end-p,CP).trim();int l=b[p+16]&255;if(name.isEmpty()||l==0)throw bad();campos.add(new Campo(name,Character.toString((char)b[p+11]),l,b[p+17]&255));total+=l;}
  if(total!=len)throw bad();int active=0,deleted=0;List<Map<String,String>> rows=new ArrayList<>();
  for(int i=0;i<n;i++){int pos=header+i*len;if(b[pos]==42){deleted++;continue;}if(b[pos]!=32)throw bad();active++;if(rows.size()<10){Map<String,String> row=new LinkedHashMap<>();int p=pos+1;for(Campo c:campos){row.put(c.nombre(),new String(b,p,c.longitud(),CP).trim());p+=c.longitud();}rows.add(row);}}
  return Map.of("campos",campos,"activos",active,"eliminados",deleted,"muestra",rows,"codificacion","Windows-1252","guardado",false);
 }
 private ResponseStatusException bad(){return new ResponseStatusException(HttpStatus.BAD_REQUEST,"DBF dBase III sin memo invalido o no admitido");}
}
