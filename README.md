# vSIAF — réplica de interfaz y módulos CRUD de demostración

Aplicación Angular con la apariencia visual basada en los recursos y plantillas del frontend de referencia. La pantalla de acceso se conecta a la API de demostración publicada en Render.

## Ejecutar localmente

Requisitos: Node.js 22.22.3 o superior y npm.

```bash
npm ci
npm start
```

Abrir http://localhost:4200.

## Acceso de demostración

- Usuario: `demo`
- Contraseña: `demo`

## Módulos conectados

- Activos fijos, transferencias, revalorizaciones, bajas y catálogos relacionados.
- Grupos contables y auxiliares.
- Oficinas y responsables.
- Administradores y entidades.
- Respaldos: crear, listar, renombrar, exportar en JSON y eliminar.
- Administración de unidades, con clave compuesta ENTIDAD + UNIDAD.
- Reporte de activos con exportación CSV e impresión.
- Comprobación del estado del servicio API.

Las tablas permiten consultar, buscar, actualizar, crear y eliminar registros cuando el endpoint correspondiente está disponible. Las escrituras requieren iniciar sesión.

## Publicación

- Frontend: https://vsiaf-exact-visual.onrender.com
- API Swagger: https://vsiaf-api-l7ws.onrender.com/swagger-ui/index.html

## Alcance y límites

Esta versión usa la API de demostración. La API emplea una base H2 en memoria, por lo que los datos de prueba pueden perderse cuando el servicio se reinicia o se vuelve a desplegar. Los campos de varios módulos son provisionales y no equivalen al esquema oficial de las 24 tablas del sistema institucional.

No se debe usar con información institucional real. Para una réplica operativa definitiva se necesita el esquema SQL Server/DBF original, sus relaciones, reglas de validación y documentación funcional. Esta aplicación no valida credenciales institucionales ni sustituye al vSIAF oficial.
