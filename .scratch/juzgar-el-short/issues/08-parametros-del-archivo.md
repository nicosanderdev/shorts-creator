# Qué parámetros del archivo fija el spec

Type: grilling
Status: resolved
Claimed by: sesión de grill
Blocked by: 04

## Question

Con la forma ya elegida, qué queda fijo de los parámetros que no cambian el cuadro ni la narración.

La investigación los dejó abiertos: bitrate, códec, extensión, tasa de muestreo, intervalo de keyframes y aceleración por hardware. `renderMediaOnWeb()` trae un defecto para cada uno (`mp4`, `h264`, `aac`, bitrate `"medium"`, 48000, un keyframe cada 5 segundos).

El spec puede adoptar esos defectos o fijar otros. La salida, descarga del blob o selector de guardado, se decide en [Qué ve la persona al renderizar](05-que-ve-al-renderizar.md), no aquí.

## Answer

El archivo se llama `Proyecto.mp4`. El video es `h264` y el audio es `aac`. El bitrate de los dos es `"medium"`. La tasa de muestreo es 48000. Hay un keyframe cada 5 segundos. La aceleración queda en `"no-preference"`: elige el navegador.

No se escribe título ni autor. El comentario es el que pone la función, e incluye «Made with Remotion».

El cuadro, la narración y la descarga no cambian. Si el navegador repite el nombre, numera `Proyecto.mp4`. El silencio inicial de la narración en Safari sigue como en [Qué forma de producir el archivo adopta el spec](04-forma-de-producir-el-archivo.md).
