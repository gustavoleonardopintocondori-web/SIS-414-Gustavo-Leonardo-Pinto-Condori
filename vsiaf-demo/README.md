# V.S.I.A.F. - Sistema de Activos Fijos — demostración académica
Proyecto independiente generado para publicar una demostración de Swagger UI en Render. No contiene código fuente privado ni datos DBF originales.
## Ejecutar
Java 17, Gradle: gradle bootRun. Abrir /swagger-ui/index.html. Login demo/demo; copiar token en Authorize. Las consultas GET son públicas. Las escrituras son solo demostrativas.
## Alcance
- CRUD de unidades administrativas: cinco campos de la captura unidadadmin.DBF; clave provisional ENTIDAD~UNIDAD.
- CRUD de 14 recursos con campos propuestos, en almacenamiento H2 JSON; no se afirma que correspondan a las 24 tablas oficiales.
- Activos: ficha, búsqueda y navegación; transferencias, bajas y revalorizaciones validan referencias al activo, pero no ejecutan cambios contables ni aprobaciones.
- Importación: vista previa DBF dBase III sin memo Windows-1252, no persiste datos.
- Respaldos: crear/listar/consultar/renombrar/eliminar/exportar instantánea demo. Restauración y copiar-de no implementados.
- Login de prueba, no seguridad de producción. Todos los datos se pierden al reiniciar. No usar datos reales.
- SQL Server, tablas restantes, autenticación real y reglas contables requieren los DBF originales y su documentación. No es una réplica exacta ni certificada.
