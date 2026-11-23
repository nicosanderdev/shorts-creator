# Qué parámetros del archivo fija el spec

Type: grilling
Blocked by: 04

## Question

Con la forma ya elegida, qué queda fijo de los parámetros que no cambian el cuadro ni la narración.

La investigación los dejó abiertos: bitrate, códec, extensión, tasa de muestreo, intervalo de keyframes y aceleración por hardware. `renderMediaOnWeb()` trae un defecto para cada uno (`mp4`, `h264`, `aac`, bitrate `"medium"`, 48000, un keyframe cada 5 segundos).

El spec puede adoptar esos defectos o fijar otros. La salida, descarga del blob o selector de guardado, se decide en [Qué ve la persona al renderizar](05-que-ve-al-renderizar.md), no aquí.
