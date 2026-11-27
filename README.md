# vSIAF — réplica visual y funcional de demostración

Frontend Angular 22 que conserva la pantalla de acceso, banner, fondos y menú del frontend de referencia. Incluye navegación por módulos, consulta de tablas, formularios de alta/modificación, eliminación, búsqueda, exportación CSV, impresión y navegación de registros.

## Ejecutar localmente

Requisitos: Node.js 22.12 o superior y npm 10 o superior.

```bash
npm ci
npm start
```

Abrir http://localhost:4200.

## Acceso de demostración

- Usuario: `demo`
- Contraseña: `demo`

## Módulos disponibles

- Activos Fijos: activos, transferencias, revalorizaciones, bajas, estados, meses, motivos de baja y organismos financiadores.
- Grupos y Auxiliares: grupos contables, auxiliares, cuentas y partidas, objetos de gasto.
- Oficinas y Responsables: oficinas, responsables y departamentos.
- Generar Reportes: reportes guardados y generación/exportación.
- Administradores: usuarios y asignaciones por organización.
- Respaldos BD: creación y descarga de respaldos de demostración.
- Administrar Unidad: unidades administrativas, entidades, estructura y configuración.
- Localización BD: estado del servicio y datos auxiliares.

## API de demostración

La aplicación consume:

`https://vsiaf-api-l7ws.onrender.com/api`

Swagger: `https://vsiaf-api-l7ws.onrender.com/swagger-ui/index.html`

## Importante: alcance actual

La API publicada está en modo DEMO y usa H2 en memoria con almacenamiento temporal. Los registros pueden perderse al reiniciarse o suspenderse el servicio. Los módulos nuevos permiten probar navegación y operaciones CRUD, pero todavía no equivalen a las 24 tablas físicas del SQL Server institucional ni implementan todas las reglas de negocio originales.

Para convertirla en réplica de producción se debe integrar el DDL/backup SQL Server oficial, verificar las claves compuestas y relaciones, y terminar las validaciones y procesos contables contra la documentación institucional. No introducir información institucional ni credenciales reales en esta demostración.

## Compilar

```bash
npm ci
npm run build:demo
npm run serve:prod
```

## Abrir en los IDE

- Visual Studio Code: abrir la carpeta, instalar la extensión Angular Language Service y ejecutar `npm start` desde Terminal.
- IntelliJ IDEA: abrir la carpeta como proyecto Node.js, configurar Node 22 y ejecutar el script `start`.
