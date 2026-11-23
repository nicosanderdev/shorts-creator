# Qué forma de producir el archivo adopta el spec

Type: grilling
Status: resolved
Claimed by: sesión de grill
Blocked by: 03, 07

## Question

La investigación de [Cómo puede el navegador producir el archivo](03-archivo-en-el-navegador.md) describe las formas que este navegador tiene para producir el archivo cerrado. Cuál adopta el spec. Si hace falta una librería, cuál. La elección incluye la captura, el compositor del DOM o HTML-in-canvas, y si el spec acepta la telemetría y la licencia que esa función documenta.

El archivo sigue siendo el ya cerrado: 1080 por 1920, 30 fotogramas por segundo, fundidos, textos, narración y la pista del video en silencio, descargado desde este navegador. El servicio de render queda fuera.

## Answer

El spec adopta `renderMediaOnWeb()`, de `@remotion/web-renderer`, y `@remotion/media` para el medio visual y la narración. Los fotogramas los pinta el compositor del DOM. HTML-in-canvas queda apagado.

El archivo sale de la composición del documento cerrado: 1080 por 1920, 30 fotogramas por segundo, el short entero, con los fundidos, los textos y la narración. La pista del medio visual va en silencio. La pista del archivo no, para que la narración quede.

En Vista previa, en pausa y al reproducir, el cuadro es esa composición. El premontaje queda apagado, igual que en el archivo, así la narración suena solo dentro de la escena. El cuadro de Escena sigue siendo el inicio de la escena elegida, sola y a opacidad plena.

La telemetría sale siempre. El editor no avisa ni pide un sí. La licencia es la gratuita si quien hace el producto entra, y de empresa si no. El texto de una política de privacidad queda fuera de este mapa.

Si el medio no se puede leer, vale el fallo ya cerrado en [Qué ve la persona al renderizar](05-que-ve-al-renderizar.md). El `blob:` del audio usa el mismo camino que el del video, sin un test propio. Un `Blob` sin tipo no tiene otra promesa. Safari puede dejar en silencio el arranque de la narración, y el spec no lo corrige.
