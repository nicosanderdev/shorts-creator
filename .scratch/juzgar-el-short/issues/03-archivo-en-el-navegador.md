# Cómo puede el navegador producir el archivo

Type: research
Status: resolved
Claimed by: investigación del archivo en el navegador

## Question

Averiguar, en documentación oficial, de qué formas este navegador puede producir el archivo ya cerrado, sin un servicio.

El archivo está cerrado. La investigación no elige forma:

- Video vertical de 1080 por 1920, a 30 fotogramas por segundo.
- La duración del short, con los fundidos: las escenas se solapan y el total se acorta en la suma de los tiempos de fundido.
- Los textos de cada escena y la narración. La narración termina con la escena. En un fundido se oyen las dos.
- La pista del video va en silencio.
- El navegador lo produce y lo descarga. No hay servidor, ni cuenta, ni cola.

El editor de hoy pinta el cuadro en el DOM y no depende de Remotion. El spec del editor prefería Remotion para la composición. El informe dice qué puede prometer el spec en el navegador, qué librerías de primera parte lo cubren y qué no cubre ninguna. Si hay más de una forma, las describe y no elige.

Separar lo que cambia lo que la persona recibe de los parámetros que no lo cambian (bitrate, códec, extensión). Esos últimos quedan para la niebla del mapa si siguen abiertos.

## Answer

El navegador puede escribir el video entero con `renderMediaOnWeb()`, de `@remotion/web-renderer`. La función corre aquí, sin servidor de Node ni cola, y devuelve un blob que se descarga, o escribe el archivo en el selector de guardado. Dentro de esa función hay dos capturas: el compositor del DOM, que es el defecto, y HTML-in-canvas, experimental y solo en Chrome, que puede volver al compositor. Las dos codifican con WebCodecs mediante Mediabunny. WebCodecs y Mediabunny, solos, escriben trozos o un archivo a partir de un canvas y de buffers: no colocan las escenas, los fundidos, los textos ni la narración. Este ticket no elige.

El spec puede prometer el archivo que la persona recibe si la composición ya expresa el documento cerrado: 1080 por 1920, 30 fotogramas por segundo, la duración acortada por los fundidos, los textos en la medida en que la captura los dibuje, las dos narraciones durante el fundido, y el medio visual en silencio sin apagar la pista de la narración. No puede prometer que el cuadro ya pintado en el DOM sea esa imagen, ni el CSS entero, ni que todo navegador codifique, ni que no salga telemetría. El bitrate, el códec y la extensión siguen abiertos.

La rama es `research/archivo-en-el-navegador`. El informe está en [`.scratch/juzgar-el-short/research/archivo-en-el-navegador.md`](../research/archivo-en-el-navegador.md).
