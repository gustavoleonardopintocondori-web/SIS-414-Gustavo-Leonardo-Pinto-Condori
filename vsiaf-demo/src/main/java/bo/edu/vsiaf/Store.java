package bo.edu.vsiaf;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.*;
@Service
class Store {
 private final JdbcTemplate jdbc;private final ObjectMapper mapper;
 Store(JdbcTemplate jdbc,ObjectMapper mapper){this.jdbc=jdbc;this.mapper=mapper;}
 Map<String,Object> decode(long id,String json){
  try{Map<String,Object> v=mapper.readValue(json,new TypeReference<LinkedHashMap<String,Object>>(){});v.put("id",id);return v;}
  catch(Exception e){throw new IllegalStateException(e);}
 }
 String encode(Object value){try{return mapper.writeValueAsString(value);}catch(Exception e){throw new IllegalArgumentException("Datos invalidos");}}
 List<Map<String,Object>> list(String r){return jdbc.query("SELECT id,contenido FROM demo_records WHERE recurso=? ORDER BY id",(rs,n)->decode(rs.getLong(1),rs.getString(2)),r);}
 Map<String,Object> find(String r,long id){return jdbc.query("SELECT id,contenido FROM demo_records WHERE recurso=? AND id=?",(rs,n)->decode(rs.getLong(1),rs.getString(2)),r,id).stream().findFirst().orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Registro inexistente"));}
 synchronized Map<String,Object> create(String r,Object data){
  if(list(r).size()>=500)throw new ResponseStatusException(HttpStatus.CONFLICT,"Limite de 500 registros por modulo demo");
  long id=Objects.requireNonNull(jdbc.queryForObject("SELECT COALESCE(MAX(id),0)+1 FROM demo_records WHERE recurso=?",Long.class,r));
  jdbc.update("INSERT INTO demo_records(recurso,id,contenido) VALUES(?,?,?)",r,id,encode(data));return find(r,id);
 }
 synchronized Map<String,Object> update(String r,long id,Object data){
  if(jdbc.update("UPDATE demo_records SET contenido=? WHERE recurso=? AND id=?",encode(data),r,id)==0)throw new ResponseStatusException(HttpStatus.NOT_FOUND);
  return find(r,id);
 }
 synchronized void delete(String r,long id){if(jdbc.update("DELETE FROM demo_records WHERE recurso=? AND id=?",r,id)==0)throw new ResponseStatusException(HttpStatus.NOT_FOUND);}
}
