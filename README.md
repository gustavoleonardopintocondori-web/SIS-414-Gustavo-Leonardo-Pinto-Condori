# vSIAF — réplica visual de interfaz

Este proyecto reproduce la interfaz del frontend de referencia proporcionado: pantalla de identificación, banner institucional, menú, ventana «Acerca de» y fondos gráficos originales incluidos en el repositorio de referencia.

## Requisitos
- Node.js 22.12 o superior
- npm 10 o superior

## Ejecutar en Visual Studio Code o IntelliJ IDEA
1. Abrir la carpeta del proyecto.
2. Ejecutar `npm ci`.
3. Ejecutar `npm start`.
4. Abrir http://localhost:4200.

## Acceso de demostración
Para esta compilación visual, el modo demo acepta:
- Usuario: `admin`
- Contraseña: `admin`

## Compilar y ejecutar como servicio
```bash
npm ci
npm run build:demo
npm run serve:prod
```

El servidor incluido sirve la compilación Angular y resuelve las rutas de cliente, como `/login` y `/home`.

## Alcance
La copia conserva las plantillas, estilos y recursos gráficos presentes en el frontend público de referencia. El repositorio de referencia no contiene la implementación de los módulos internos completos ni el backend institucional; por tanto, esta réplica visual no sustituye al sistema institucional ni valida credenciales reales. El acceso demo es solo para visualizar la interfaz.
