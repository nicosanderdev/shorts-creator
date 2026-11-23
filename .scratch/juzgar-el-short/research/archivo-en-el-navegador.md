# Cómo puede el navegador producir el archivo

## Pregunta

De qué formas este navegador puede producir el archivo ya cerrado, sin un servicio, y qué puede prometer el spec.

El archivo está cerrado. Video vertical de 1080 por 1920, a 30 fotogramas por segundo. La duración del short incluye los fundidos: las escenas vecinas se solapan y el total se acorta en la suma de los tiempos de fundido; cada escena conserva su duración. Los textos de cada escena y la narración. La narración termina con la escena. En un fundido se oyen las dos. La pista del medio visual va en silencio. El navegador produce el archivo y lo descarga. No hay servidor, ni cuenta de la persona, ni cola.

El editor de hoy pinta el cuadro en el DOM y no depende de Remotion. El spec del editor prefería Remotion para la composición (una composición por proyecto, una secuencia por escena) y dejaba el servicio de render fuera. El mapeo de esa composición está en otra nota; aquí se vuelven a leer las páginas que deciden el archivo.

Si hay más de una forma, se describen y no se elige.

## Fuentes

Páginas leídas el 23 de noviembre de 2026. Son documentación oficial de Remotion (remotion.dev), la página del proyecto Mediabunny que Remotion nombra como codificador, el borrador de WebCodecs y las páginas de MDN que apuntan a esa especificación. No se usaron artículos de terceros.

Las páginas de Remotion no imprimen una fecha de revisión. La de render en el navegador dice que la API es estable desde la v4.0.491. El borrador de WebCodecs está fechado el 19 de noviembre de 2026. Las páginas de MDN leídas ese día no muestran fecha.

- [Client-side rendering](https://www.remotion.dev/docs/client-side-rendering)
- [@remotion/web-renderer](https://www.remotion.dev/docs/web-renderer/)
- [renderMediaOnWeb()](https://www.remotion.dev/docs/web-renderer/render-media-on-web)
- [canRenderMediaOnWeb()](https://www.remotion.dev/docs/web-renderer/can-render-media-on-web)
- [renderStillOnWeb()](https://www.remotion.dev/docs/web-renderer/render-still-on-web)
- [How client-side rendering works](https://www.remotion.dev/docs/client-side-rendering/how-it-works)
- [Limitations of client-side rendering](https://www.remotion.dev/docs/client-side-rendering/limitations)
- [HTML-in-canvas for client-side rendering](https://www.remotion.dev/docs/client-side-rendering/html-in-canvas)
- [HTML-in-canvas Bugs](https://www.remotion.dev/docs/html-in-canvas-bugs)
- [WebCodecs Bugs](https://www.remotion.dev/docs/mediabunny/webcodecs-bugs)
- [Mediabunny (Remotion)](https://www.remotion.dev/docs/mediabunny/)
- [Mediabunny](https://mediabunny.dev/)
- [Telemetry](https://www.remotion.dev/docs/telemetry)
- [@remotion/licensing](https://www.remotion.dev/docs/licensing/)
- [Server-side rendering](https://www.remotion.dev/docs/ssr)
- [renderMedia()](https://www.remotion.dev/docs/renderer/render-media)
- [TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries)
- [fade()](https://www.remotion.dev/docs/transitions/presentations/fade)
- [Sequence](https://www.remotion.dev/docs/sequence)
- [Video (`@remotion/media`)](https://www.remotion.dev/docs/media/video)
- [Audio (`@remotion/media`)](https://www.remotion.dev/docs/media/audio)
- [Volume and muting](https://www.remotion.dev/docs/audio/volume)
- [WebCodecs, W3C Working Draft, 19 November 2026](https://www.w3.org/TR/webcodecs/)
- [VideoEncoder (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder)
- [AudioEncoder (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/AudioEncoder)

## Las formas

Hay una función que escribe el video entero en el navegador. Dentro de esa función hay dos formas de capturar el cuadro. El codificador que hay debajo escribe el archivo y no arma el short. Este informe no elige.

### `renderMediaOnWeb()`, compositor del DOM

`renderMediaOnWeb()`, de `@remotion/web-renderer`, renderiza un video o un audio en el navegador. Para un solo fotograma como imagen está `renderStillOnWeb()`. La API es estable desde la v4.0.491. Corre en el navegador: no hace falta un servidor de Node ni Remotion Lambda. No hay paso de bundle: recibe el componente y la configuración del video. Codifica con WebCodecs usando Mediabunny, en lugar de FFmpeg. ([Client-side rendering](https://www.remotion.dev/docs/client-side-rendering), [@remotion/web-renderer](https://www.remotion.dev/docs/web-renderer/), [renderMediaOnWeb()](https://www.remotion.dev/docs/web-renderer/render-media-on-web))

La composición que recibe lleva `id`, `component`, `durationInFrames`, `fps`, `width` y `height`. Un short de 1080 por 1920 a 30 fotogramas por segundo es esa composición con esos tres números. 1080 y 1920 son múltiplos de 2: la comprobación de H.264 y H.265, que pide ancho y alto pares, no rechaza este tamaño. Eso no elige el códec. ([renderMediaOnWeb()](https://www.remotion.dev/docs/web-renderer/render-media-on-web), [canRenderMediaOnWeb()](https://www.remotion.dev/docs/web-renderer/can-render-media-on-web))

El largo del archivo es `durationInFrames` de esa composición. El render no recalcula el fundido. En `<TransitionSeries>`, una transición acorta el total porque las dos escenas se solapan: durante la transición las dos se renderizan a la vez, y cada secuencia conserva su `durationInFrames`. El ejemplo de la página, 40 y 60 con una transición de 30, dura 70. Con tres escenas, el total es la suma de las duraciones menos la suma de las transiciones. `fade()` hace entrar la escena nueva por opacidad encima de la que sale. ([TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries), [fade()](https://www.remotion.dev/docs/transitions/presentations/fade))

La captura por defecto no fotografía el viewport. Remotion dice que capturar el viewport no es posible. Monta el componente en el DOM donde la persona no lo ve, recorre el árbol y dibuja en un canvas lo que sabe colocar. De `<img>`, `<canvas>` y `<video>` toma los píxeles. El texto lo reconstruye: envuelve cada tramo, mide con `getBoundingClientRect()` y lo dibuja. `opacity` está entre las propiedades que ese compositor dibuja, así que un fundido de opacidad entra en el cuadro que codifica. ([How client-side rendering works](https://www.remotion.dev/docs/client-side-rendering/how-it-works), [Limitations](https://www.remotion.dev/docs/client-side-rendering/limitations))

Los componentes que esa captura admite incluyen `<Video>` y `<Audio>` de `@remotion/media`, `<Img>` y `<Gif>` de `@remotion/gif`. `<OffthreadVideo>`, `<Html5Video>` y `<Html5Audio>` no. El cuadro que el editor pinta hoy con un `<video>` y un `<audio>` del DOM no es la entrada de esta función. ([Limitations](https://www.remotion.dev/docs/client-side-rendering/limitations))

El audio que entra en la pista del archivo es el de los `<Audio>` y `<Video>` que están montados: se capturan, se mezclan y se añaden a la pista. `durationInFrames` de una `<Sequence>` dice cuánto tiempo siguen montados sus hijos. Una narración colocada en la secuencia de la escena ocupa ese tramo. En el fundido las dos escenas están renderizadas, así que las dos narraciones están montadas y la mezcla las incluye. ([How client-side rendering works](https://www.remotion.dev/docs/client-side-rendering/how-it-works), [Sequence](https://www.remotion.dev/docs/sequence), [TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries), [Audio](https://www.remotion.dev/docs/media/audio))

La pista del medio visual se queda en silencio con `muted` en ese `<Video>`, o con `volume` 0. La imagen sigue. El volumen por defecto es 1. `muted: true` en `renderMediaOnWeb()` es otra cosa: el archivo sale sin pista de audio, y con ella se iría también la narración. ([Volume and muting](https://www.remotion.dev/docs/audio/volume), [Video](https://www.remotion.dev/docs/media/video), [renderMediaOnWeb()](https://www.remotion.dev/docs/web-renderer/render-media-on-web))

Al terminar, `getBlob()` devuelve el video. El ejemplo de la página crea una URL del blob y dispara una descarga con `<a download>`. Otra salida documentada escribe el archivo en un `WritableStream`: el ejemplo abre `showSaveFilePicker` y no llama a `getBlob()`. Las dos ocurren en el navegador. ([renderMediaOnWeb()](https://www.remotion.dev/docs/web-renderer/render-media-on-web))

Hace falta WebCodecs. La tabla de Remotion pide Chrome 94 o más, Firefox 130 o más, y Safari 26 o más. `canRenderMediaOnWeb()` puede decir que este navegador no puede, por ejemplo si WebCodecs no está o si el códec no se puede codificar. Aunque acepte la configuración, la codificación puede fallar o tardar en arrancar. ([Client-side rendering](https://www.remotion.dev/docs/client-side-rendering), [canRenderMediaOnWeb()](https://www.remotion.dev/docs/web-renderer/can-render-media-on-web), [renderMediaOnWeb()](https://www.remotion.dev/docs/web-renderer/render-media-on-web))

### `renderMediaOnWeb()`, HTML-in-canvas

La misma función acepta `allowHtmlInCanvas: true`. El defecto es `false`. En Chrome, y solo en Chrome, puede capturar el fotograma con la API experimental HTML-in-canvas (`drawElementImage`). Si esa captura está activa, las limitaciones de CSS del compositor no aplican, porque se toma una captura del cuadro. La página avisa de que los píxeles pueden diferir del compositor del DOM. Si la API no está, si el anidado no se soporta, o si un fotograma falla, vuelve al compositor del DOM. Activar la opción no garantiza que se use. ([HTML-in-canvas](https://www.remotion.dev/docs/client-side-rendering/html-in-canvas), [Limitations](https://www.remotion.dev/docs/client-side-rendering/limitations))

Sigue siendo `renderMediaOnWeb()`: el mismo video, la misma descarga, el mismo codificador. Cambia cómo se pintan los fotogramas. Este informe no elige entre las dos capturas.

### El codificador, que no arma el short

Las dos capturas de arriba terminan igual: Mediabunny codifica los fotogramas y el audio ya mezclado en un archivo de video. Remotion lo describe como WebCodecs mediante Mediabunny, en lugar de FFmpeg. Mediabunny es un proyecto aparte. Remotion lo usa también en `@remotion/media`. ([How client-side rendering works](https://www.remotion.dev/docs/client-side-rendering/how-it-works), [Client-side rendering](https://www.remotion.dev/docs/client-side-rendering), [Mediabunny (Remotion)](https://www.remotion.dev/docs/mediabunny/))

La página de Mediabunny muestra cómo escribir un archivo en el cliente: un `Output` con `CanvasSource` para el video y `AudioBufferSource` para el audio, y `finalize()` deja el buffer. También convierte un archivo que ya existe. No coloca escenas, fundidos, textos ni narración. ([Mediabunny](https://mediabunny.dev/))

WebCodecs define interfaces para codificar y decodificar audio, video e imagen. No exige ningún códec: un navegador puede ofrecer unos, otros, o ninguno. `VideoEncoder` codifica objetos `VideoFrame` en `EncodedVideoChunk`. `AudioEncoder` codifica objetos `AudioData`. Las dos interfaces están expuestas en un contexto seguro. MDN dice lo mismo: contexto seguro, y disponibilidad limitada. La especificación entrega trozos codificados. No entrega el archivo del short ni el cuadro. ([WebCodecs](https://www.w3.org/TR/webcodecs/), [VideoEncoder](https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder), [AudioEncoder](https://developer.mozilla.org/en-US/docs/Web/API/AudioEncoder))

## Lo que el spec puede prometer

Con `renderMediaOnWeb()` y una composición que ya exprese el documento cerrado, la persona puede recibir, en este navegador:

- Un archivo de video, no una imagen. Lo codifica el navegador y lo descarga aquí, con el blob o con el selector de archivo. No hay servicio de render, ni cola, ni cuenta de la persona para obtener el archivo. ([renderMediaOnWeb()](https://www.remotion.dev/docs/web-renderer/render-media-on-web), [Client-side rendering](https://www.remotion.dev/docs/client-side-rendering))
- El cuadro a 1080 por 1920 y 30 fotogramas por segundo, que son `width`, `height` y `fps`. ([renderMediaOnWeb()](https://www.remotion.dev/docs/web-renderer/render-media-on-web))
- La duración del short que tenga la composición. Con `<TransitionSeries>`, esa duración es la suma de las escenas menos la suma de los fundidos, y cada escena sigue su `durationInFrames`. Durante el fundido las dos escenas están en el cuadro. ([TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries))
- Los textos, como HTML dentro de la composición, en la medida en que la captura los dibuje. En el compositor del DOM entran, entre otras, posición y tamaño medidos en el DOM, `color`, `font-family`, `font-size` y `opacity`. ([How client-side rendering works](https://www.remotion.dev/docs/client-side-rendering/how-it-works), [Limitations](https://www.remotion.dev/docs/client-side-rendering/limitations))
- La narración en la pista de audio del archivo, y las dos narraciones a la vez durante el fundido, porque las dos escenas están montadas y el audio montado se mezcla. El medio visual no aporta sonido si su `<Video>` va con `muted` o con `volume` 0. ([How client-side rendering works](https://www.remotion.dev/docs/client-side-rendering/how-it-works), [Volume and muting](https://www.remotion.dev/docs/audio/volume))

## Lo que ninguna vía cubre

Ninguna de las vías de arriba fotografía el cuadro que el editor ya pinta. Capturar el viewport no es posible. El editor de hoy no usa Remotion, y sus elementos de video y de audio del DOM no son los componentes que el render del navegador admite. Si `<Video>` o `<Audio>` no pueden decodificar el medio, el render en el navegador falla: no hay respaldo a `<OffthreadVideo>` ni a `<Html5Audio>`, que en el servidor sí existen. ([How client-side rendering works](https://www.remotion.dev/docs/client-side-rendering/how-it-works), [Limitations](https://www.remotion.dev/docs/client-side-rendering/limitations), [Video](https://www.remotion.dev/docs/media/video), [Audio](https://www.remotion.dev/docs/media/audio))

El compositor del DOM no promete el CSS entero. Lo que no está en la lista de la página de limitaciones no se dibuja. El texto se reconstruye, no se copia píxel a píxel. `z-index` está a medias. Los filtros no están en Safari. HTML-in-canvas acerca la captura a una imagen del cuadro, solo en Chrome, en experimental, con píxeles que pueden diferir, y con vuelta al compositor si falla. La página de bugs de esa API sigue abierta en varios informes. ([Limitations](https://www.remotion.dev/docs/client-side-rendering/limitations), [HTML-in-canvas](https://www.remotion.dev/docs/client-side-rendering/html-in-canvas), [HTML-in-canvas Bugs](https://www.remotion.dev/docs/html-in-canvas-bugs))

`object-fit` aparece como soportado en la página de limitaciones. En `<Video>`, la página del componente dice que la propiedad CSS `object-fit` no sirve y que el encaje es la prop `objectFit`. Las dos páginas están vigentes el día de esta lectura. Este informe no las concilia.

No todo navegador codifica. Hace falta WebCodecs, en las versiones de la tabla, y un contexto seguro para `VideoEncoder` y `AudioEncoder`. El borrador no obliga a ningún códec. `canRenderMediaOnWeb()` puede negarlo. Un navegador que acepta la configuración puede fallar igual. En la lista de bugs abiertos, el `AudioEncoder` de AAC en Safari trata las primeras 1024 muestras como silencio: eso cambia el arranque de la narración en ese navegador. La lista tiene más fallos de marca de tiempo y de decodificación. ([Client-side rendering](https://www.remotion.dev/docs/client-side-rendering), [WebCodecs](https://www.w3.org/TR/webcodecs/), [VideoEncoder](https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder), [AudioEncoder](https://developer.mozilla.org/en-US/docs/Web/API/AudioEncoder), [WebCodecs Bugs](https://www.remotion.dev/docs/mediabunny/webcodecs-bugs))

La narración que termina exactamente con la escena tiene un hueco. La captura mezcla el audio que está montado. `premountFor` monta el audio antes de `from`, y `postmountFor` lo deja montado después. La página de `<Sequence>` da un defecto de dos segundos en Studio desde la v4.0.535, y en el Player cero segundos en v4 y dos en v5. `renderMediaOnWeb()` no dice cuál de esos defectos usa. Un `premountFor` explícito manda. Las páginas leídas no dicen si ese tramo premontado entra en la mezcla. ([Sequence](https://www.remotion.dev/docs/sequence), [Audio](https://www.remotion.dev/docs/media/audio), [How client-side rendering works](https://www.remotion.dev/docs/client-side-rendering/how-it-works))

El `src` documentado de `<Video>` y de `<Audio>` es `staticFile()` o una URL. Una URL remota tiene que permitir CORS. Las páginas leídas no dicen si un `blob:` de la biblioteca de este navegador vale como `src`.

El archivo se produce aquí, y aun así sale un aviso de telemetría. `renderMediaOnWeb()` envía siempre un evento, haya o no `licenseKey`: dominio (`window.location.origin`), si fue video o imagen, si fue producción, si terminó bien, y la IP. No manda el contenido del video. El evento no bloquea ni tumba el render, aunque falle la petición o la licencia esté violada. Antes de Remotion 5.0 la clave es voluntaria, con la excepción de que el web renderer envía el evento igual. Quien no entra en la licencia gratuita necesita una licencia de empresa. Eso es una obligación del producto, no una cuenta de la persona ni una cola. ([Telemetry](https://www.remotion.dev/docs/telemetry), [@remotion/licensing](https://www.remotion.dev/docs/licensing/))

Estas APIs no producen este archivo:

- `renderMedia()` y el render de servidor corren en Node. Escriben a una ruta del disco, lanzan un Chromium y codifican con FFmpeg. Es el servicio que el spec del editor dejó fuera. ([Server-side rendering](https://www.remotion.dev/docs/ssr), [renderMedia()](https://www.remotion.dev/docs/renderer/render-media))
- `renderStillOnWeb()` y `renderFramesOnWeb()` sacan imágenes, no el video del short. `renderStill()` del paquete de servidor es lo mismo del lado de Node. ([renderStillOnWeb()](https://www.remotion.dev/docs/web-renderer/render-still-on-web), [@remotion/web-renderer](https://www.remotion.dev/docs/web-renderer/))
- La página de MediaRecorder de Remotion habla de arreglar un WebM grabado con `getUserMedia()`. No presenta MediaRecorder como forma de capturar la composición. La página de cómo funciona el render en el navegador dice que el viewport no se puede capturar. Este informe no propone una captura de pantalla.

## Parámetros que no cambian lo que la persona recibe

El cuadro, la duración, los fundidos, los textos, la narración y el silencio del medio visual no dependen del bitrate, del códec ni de la extensión.

`renderMediaOnWeb()` tiene defecto `mp4`. El códec de video por defecto es `h264` en `mp4`, `mkv` y `mov`, y `vp8` en `webm`. El de audio es `aac` en `mp4`, `mkv`, `mov` y `aac`, y `opus` en `webm` y `ogg`. El bitrate de video y el de audio parten de `"medium"`. También aceptan un número en bits por segundo, otros escalones (`"very-low"` a `"very-high"`) y, para el video, un `Quality` de Mediabunny. La extensión acompaña al contenedor en los ejemplos (`video.mp4`). ([renderMediaOnWeb()](https://www.remotion.dev/docs/web-renderer/render-media-on-web))

Esos tres siguen abiertos. El documento cerrado no los nombra, y las páginas ofrecen más de un valor. En el mismo grupo, porque tampoco cambian el cuadro ni la narración que se oye: la tasa de muestreo (defecto 48000), el intervalo de keyframes (defecto 5 segundos), la aceleración por hardware, y si el archivo sale por el blob o por el selector. Este informe no elige.

Sí cambian lo que la persona recibe, y por eso no quedan en esa niebla: `scale` distinto de 1 cambia el tamaño en píxeles; `frameRange` recorta el short; `transparent: true` pide canal alfa, y solo en `webm` o `mkv` con `vp8` o `vp9`; `muted: true` en el render quita la pista entera, narración incluida. El archivo cerrado quiere el cuadro a 1080 por 1920, el short entero, y la narración en la pista.
