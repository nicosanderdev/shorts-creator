# Cómo se mapea un proyecto a Remotion

## Pregunta

Cómo representa Remotion el documento ya cerrado de un short: una composición por proyecto, una secuencia por escena en orden, un medio visual por escena (imagen durante toda la escena, o video cuyo recorte de entrada y salida es la duración), cero o más textos, una narración opcional que termina con la escena, y entre escenas un corte directo o un fundido.

La duración del fundido, y si ese tiempo se superpone a las dos escenas o se descuenta de ellas, quedan sin elegir. Los campos de cada texto también. FFmpeg entra solo para marcar qué preparación del medio, si alguna, la composición no hace sola.

## Fuentes

Páginas leídas el 20 de noviembre de 2026. Son documentación oficial de Remotion (remotion.dev) y, para el límite de conversión, la documentación oficial de FFmpeg. No se usaron artículos de terceros.

- [Composition](https://www.remotion.dev/docs/composition)
- [Variable duration and dimensions](https://www.remotion.dev/docs/dynamic-metadata)
- [Sequence](https://www.remotion.dev/docs/sequence)
- [useVideoConfig()](https://www.remotion.dev/docs/use-video-config)
- [Series](https://www.remotion.dev/docs/series)
- [TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries)
- [Transitions](https://www.remotion.dev/docs/transitioning)
- [fade()](https://www.remotion.dev/docs/transitions/presentations/fade)
- [linearTiming()](https://www.remotion.dev/docs/transitions/timings/lineartiming)
- [Transitioning with audio](https://www.remotion.dev/docs/transitions/audio-transitions)
- [interpolate()](https://www.remotion.dev/docs/interpolate)
- [AbsoluteFill](https://www.remotion.dev/docs/absolute-fill)
- [Img](https://www.remotion.dev/docs/img)
- [Importing assets](https://www.remotion.dev/docs/assets)
- [Video (`@remotion/media`)](https://www.remotion.dev/docs/media/video)
- [Audio (`@remotion/media`)](https://www.remotion.dev/docs/media/audio)
- [Trimming, delaying and looping](https://www.remotion.dev/docs/audio/trimming)
- [Volume and muting](https://www.remotion.dev/docs/audio/volume)
- [Supported media](https://www.remotion.dev/docs/media/support)
- [Supported formats and codecs by Mediabunny](https://www.remotion.dev/docs/mediabunny/formats)
- [OffthreadVideo](https://www.remotion.dev/docs/offthreadvideo)
- [Which video formats does Remotion support?](https://www.remotion.dev/docs/miscellaneous/video-formats)
- [Using fonts](https://www.remotion.dev/docs/fonts)
- [loadFont()](https://www.remotion.dev/docs/google-fonts/load-font)
- [Premounting](https://www.remotion.dev/docs/player/premounting)
- [measureText()](https://www.remotion.dev/docs/layout-utils/measure-text)
- [renderMedia()](https://www.remotion.dev/docs/renderer/render-media)
- [Parallel encoding](https://www.remotion.dev/docs/parallel-encoding)
- [npx remotion ffmpeg](https://www.remotion.dev/docs/cli/ffmpeg)
- [ffmpeg Documentation](https://ffmpeg.org/ffmpeg.html)

## Mapeo

### Composición

Una `<Composition>` es el video que se quiere crear. Lleva `id`, `fps`, `durationInFrames`, `width`, `height` y un componente de React. El `id` solo admite letras, números y `-`. Se pueden registrar varias composiciones; el documento usa una. ([Composition](https://www.remotion.dev/docs/composition))

`width` y `height` son píxeles independientes. No hay un modo «vertical»: un short vertical es una composición con altura mayor que el ancho. Los ejemplos de la página usan 1080×1080, y la misma API acepta otra relación. ([Composition](https://www.remotion.dev/docs/composition))

La unidad de tiempo de la composición es el fotograma. `fps` es la tasa y `durationInFrames` es el largo. `calculateMetadata` puede devolver `durationInFrames`, y también `fps`, `width` y `height`, a partir de las props. Las props de entrada sustituyen a `defaultProps`. Esas props tienen que ser JSON serializable: se pierden funciones y clases. `Date`, `Map`, `Set` y `staticFile()` sí se serializan. ([Composition](https://www.remotion.dev/docs/composition), [Variable duration and dimensions](https://www.remotion.dev/docs/dynamic-metadata))

El componente de la composición recibe el proyecto como props y devuelve el árbol de escenas. Remotion no tiene un tipo «proyecto» ni «biblioteca». Un medio de la biblioteca entra como `src`: `staticFile()` para un archivo del bundle, o una URL. Una URL remota de video o de audio tiene que permitir CORS; si no, en el render de servidor se intenta el componente de respaldo. ([Importing assets](https://www.remotion.dev/docs/assets), [Video](https://www.remotion.dev/docs/media/video), [Audio](https://www.remotion.dev/docs/media/audio))

### Secuencia por escena

Hay tres formas de poner las escenas en orden. Las tres usan la misma idea de secuencia: `durationInFrames` es cuánto dura el tramo en la línea de tiempo del hijo, y con `playbackRate` 1 ese tramo ocupa los mismos fotogramas en el padre. ([Sequence](https://www.remotion.dev/docs/sequence))

1. `<Series>` encadena `<Series.Sequence>`. La siguiente empieza después de `durationInFrames / playbackRate` de la anterior. Fuera de ese rango, los hijos se desmontan. Con `offset` 0 no hay hueco ni solape. Un `offset` positivo retrasa la secuencia y deja fotogramas en blanco. Un `offset` negativo la adelanta, la superpone a la anterior y desplaza a las que siguen. Solo la última secuencia puede durar `Infinity`. ([Series](https://www.remotion.dev/docs/series))

2. `<TransitionSeries>` se comporta como `<Series>` y, además, admite un `<TransitionSeries.Transition>` o un `<TransitionSeries.Overlay>` entre dos `<TransitionSeries.Sequence>`. Sin transición, no hay acortamiento. Con una transición, las dos escenas se renderizan a la vez y el total se acorta en la duración de la transición. `<TransitionSeries.Sequence>` también acepta `offset`, con el mismo sentido que en `<Series>`. ([TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries))

3. `<Sequence from>` y `<Sequence durationInFrames>` colocan cada escena a mano. Cuando la secuencia está en su fotograma `from`, los hijos ven el fotograma 0. Una secuencia anidada suma los `from`: una que empieza en el fotograma 60 dentro de otra que empieza en el 30 hace empezar a sus hijos en el 90. `durationInFrames` limita cuánto tiempo están montados los hijos. La página dice que usar `<Sequence>` directo ya no es lo recomendado, y que sigue siendo posible. ([Sequence](https://www.remotion.dev/docs/sequence))

`<Series>` y `<TransitionSeries>` son las dos formas de «una secuencia por escena, en orden». Cuál de las dos envuelve el proyecto depende de si algún corte lleva fundido. Este informe no elige.

La duración de la `<Composition>` no la calcula sola la serie. Hay que pasarla en `durationInFrames` o devolverla desde `calculateMetadata`. ([Composition](https://www.remotion.dev/docs/composition), [Variable duration and dimensions](https://www.remotion.dev/docs/dynamic-metadata))

Con cortes en serie y `playbackRate` 1, el largo es la suma de las duraciones de las escenas. En el ejemplo de `<TransitionSeries>`, escenas de 40, 60 y 90 fotogramas con transiciones de 30 y 45 dan `40 + 60 + 90 - 30 - 45`. Cada escena sigue visible sus propios `durationInFrames`; el solape es lo que resta del total. ([Series](https://www.remotion.dev/docs/series), [TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries))

`playbackRate` por defecto es 1. Si no es 1, la secuencia ocupa `durationInFrames / playbackRate` fotogramas del padre, y `durationInFrames` y `trimBefore` se miden en la línea de tiempo del hijo. El documento cerrado no habla de velocidad. La igualdad «duración de la escena = fotogramas que ocupa en el short» vale con el valor por defecto. ([Sequence](https://www.remotion.dev/docs/sequence))

### Imagen

`<Img>` se usa como un `<img>`. Remotion espera a que la imagen esté cargada antes de renderizar el fotograma. Acepta `src` por `staticFile()` o por URL, y hereda `from` y `durationInFrames` de `<Sequence>`. Esos dos valores la mantienen montada durante la escena. Una imagen quieta no tiene recorte de entrada ni de salida: la duración de la escena es el tiempo que está montada. ([Img](https://www.remotion.dev/docs/img), [Importing assets](https://www.remotion.dev/docs/assets))

El `import` de archivos admite `.png`, `.svg`, `.jpg`, `.jpeg`, `.webp`, `.gif` y `.bmp`. La vía recomendada para los medios es `staticFile()`, no ese `import`. ([Importing assets](https://www.remotion.dev/docs/assets))

`<Img>` no es el componente de un GIF. Para un GIF, la página remite a `@remotion/gif`. ([Img](https://www.remotion.dev/docs/img))

El tamaño entra por las props de un `<img>`, incluido `style`. `<Video>` es distinto: ahí `object-fit` de CSS no sirve y el encaje es la prop `objectFit`. ([Img](https://www.remotion.dev/docs/img), [Video](https://www.remotion.dev/docs/media/video))

### Video recortado

El componente recomendado es `<Video>` de `@remotion/media`. Durante el render extrae el fotograma exacto con Mediabunny y lo muestra en un `<img>`, alineado con la línea de tiempo de Remotion. ([Video](https://www.remotion.dev/docs/media/video))

El recorte es `trimBefore` más `durationInFrames`. `trimBefore` quita el tramo inicial. `durationInFrames` toma esa cantidad de fotogramas de origen a partir de `trimBefore`. Los dos se miden en fotogramas a la tasa de la composición, no en fotogramas del archivo. En el ejemplo, con `fps` 30, `trimBefore={2 * fps}` y `durationInFrames={2 * fps}` reproducen del segundo 2 al segundo 4. ([Trimming, delaying and looping](https://www.remotion.dev/docs/audio/trimming), [Video](https://www.remotion.dev/docs/media/video))

Eso coincide con el documento cerrado cuando `playbackRate` es 1: la entrada es `trimBefore`, la duración de la escena es `durationInFrames`, y la salida es la entrada más esa duración. Cambiar la duración cambia `durationInFrames` y mueve la salida; `trimBefore` se queda. `trimAfter`, `startFrom` y `endAt` están deprecados. La forma vigente es `durationInFrames` desde `trimBefore`. ([Video](https://www.remotion.dev/docs/media/video), [OffthreadVideo](https://www.remotion.dev/docs/offthreadvideo))

El archivo no se pre-corta. El mismo `src` sigue entero y la composición elige el rango. ([Trimming, delaying and looping](https://www.remotion.dev/docs/audio/trimming))

Si el video llega a su fin y `loop` no está puesto, el último fotograma sigue visible. Un rango pedido más largo que el archivo no acorta la escena: la escena sigue su `durationInFrames` y la imagen se queda en el último fotograma. ([Video](https://www.remotion.dev/docs/media/video))

`objectFit` acepta `contain` (el defecto), `cover`, `fill`, `none` y `scale-down`. `contain` mantiene la relación y puede dejar bandas. `cover` llena el elemento y recorta. La prop `style` acepta el estilo de un `<img>`, por ejemplo ancho y alto al 100 %. ([Video](https://www.remotion.dev/docs/media/video))

`<Video>` reproduce el audio del archivo salvo que se pase `muted` o se baje `volume`. El volumen por defecto es 1. `volume` 0 lo silencia. El documento llama al medio «visual» y deja la narración como otro audio. Remotion, por su cuenta, incluye la pista del video. ([Video](https://www.remotion.dev/docs/media/video), [Volume and muting](https://www.remotion.dev/docs/audio/volume))

### Textos

Remotion no trae un componente Texto ni un esquema de campos. Un texto es un nodo de React, por ejemplo un `<h1>` o un `<div>`, con el contenido como hijo. ([AbsoluteFill](https://www.remotion.dev/docs/absolute-fill))

La posición y el estilo son CSS en `style`. `<AbsoluteFill>` es un `div` absoluto que llena al padre (`top`, `left`, `right`, `bottom` en 0, ancho y alto al 100 %) y usa flex en columna. Reenvía `style` y `className`. En el ejemplo, el video va en un `<AbsoluteFill>` y el texto en otro, después: las capas que se renderizan al final quedan arriba. Varios textos son varias capas. ([AbsoluteFill](https://www.remotion.dev/docs/absolute-fill))

La fuente es `fontFamily` después de cargarla. Hay cuatro vías documentadas: `@remotion/google-fonts` (`loadFont`, que bloquea el render hasta que la fuente está lista), un `@import` de Google Fonts (desde la versión 2.2 Remotion espera a que carguen), `@remotion/fonts` con un archivo en `public/`, y la API `FontFace` con `delayRender` / `continueRender`. ([Using fonts](https://www.remotion.dev/docs/fonts), [loadFont()](https://www.remotion.dev/docs/google-fonts/load-font))

`@remotion/layout-utils` puede medir un texto o calcular un `font-size` para un ancho. `measureText()` solo funciona en el navegador, no en Node.js ni en Bun. Es una ayuda de maquetación, no un campo del documento. ([measureText()](https://www.remotion.dev/docs/layout-utils/measure-text))

El intervalo dentro de la escena también está cubierto, sin fijar un modelo. `<AbsoluteFill>` hereda `from` y `durationInFrames`. El ejemplo con `from={30}` y `durationInFrames={90}` está visible del fotograma 30 al 119. Esas props, anidadas en la secuencia de la escena, se desplazan con ella por la cascada de secuencias. Otra forma es envolver el nodo en `<Sequence from durationInFrames>`. Cero textos es no poner ninguna capa. Varios textos son varias capas, cada una con su `from` y su `durationInFrames`. ([AbsoluteFill](https://www.remotion.dev/docs/absolute-fill), [Sequence](https://www.remotion.dev/docs/sequence))

Lo que Remotion puede colocar, entonces, es el contenido del nodo, la posición y el estilo CSS (incluida la fuente cargada), el orden de apilado por el orden de las capas, y el intervalo `from` + `durationInFrames` relativo a la escena. Qué campos guarda el documento para eso no lo dice Remotion.

### Narración

`<Audio>` de `@remotion/media` es el componente recomendado. En el render extrae el audio con Mediabunny, no con FFmpeg. `src` es `staticFile()` o una URL con CORS. ([Audio](https://www.remotion.dev/docs/media/audio))

El recorte usa las mismas props que el video: `trimBefore` y `durationInFrames`, en fotogramas de la composición. `from` retrasa el inicio sin saltar contenido del archivo. `durationInFrames` elige cuántos fotogramas de origen suenan a partir de `trimBefore`, y el clip ocupa `durationInFrames / playbackRate` fotogramas en el padre. Se puede envolver en una secuencia exterior; los tiempos se anidan. ([Audio](https://www.remotion.dev/docs/media/audio), [Trimming, delaying and looping](https://www.remotion.dev/docs/audio/trimming))

La narración opcional es un `<Audio>` dentro de la secuencia de la escena. En `<Series>`, los hijos se desmontan fuera del rango de la secuencia. Con `durationInFrames` del audio igual al tramo que le toca dentro de la escena, y `playbackRate` 1, el clip ocupa solo ese tramo. En un corte sin solape, no sigue sonando en la escena siguiente: la siguiente secuencia todavía no ha empezado. ([Series](https://www.remotion.dev/docs/series), [Audio](https://www.remotion.dev/docs/media/audio))

`volume` es un número de 0 a 1, o un valor animado con `useCurrentFrame()` e `interpolate()`. El defecto es 1. `muted` deja el componente montado y no suena. El punto de inicio, el volumen y un audio más corto que la escena siguen abiertos en el mapa; las props que los expresarían son `from`, `trimBefore`, `volume` y el fin natural del archivo. Este informe no elige esos campos. ([Volume and muting](https://www.remotion.dev/docs/audio/volume), [Audio](https://www.remotion.dev/docs/media/audio))

`premountFor` monta el audio antes de `from` para que haga buffer antes de que empiece la reproducción. El premontaje vale en el Player y en Studio y no afecta al render. ([Audio](https://www.remotion.dev/docs/media/audio), [Premounting](https://www.remotion.dev/docs/player/premounting))

### Corte y fundido

**Corte directo.** `<Series>` con `offset` 0: la escena siguiente empieza cuando termina la anterior y los hijos de la anterior se desmontan. El corte no añade fotogramas. `<TransitionSeries>` sin un `<TransitionSeries.Transition>` entre esas dos secuencias sigue el mismo comportamiento de `<Series>`. ([Series](https://www.remotion.dev/docs/series), [TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries))

Un `<TransitionSeries.Transition>` sin `presentation` no es un corte. La presentación por defecto es `slide()`. ([TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries))

**Fundido que superpone y acorta el total.** `<TransitionSeries.Transition presentation={fade()} timing={...}>` entre dos secuencias. Durante la transición las dos escenas se renderizan a la vez y el total baja en la duración de la transición. Las `durationInFrames` de cada escena no se reescriben: cada una sigue visible su duración, y parte de ese tiempo coincide con la otra. En el ejemplo, 40 y 60 con una transición de 30 duran 70. ([TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries), [fade()](https://www.remotion.dev/docs/transitions/presentations/fade))

`linearTiming({ durationInFrames })` fija esa duración en fotogramas. Acepta un `easing`. Otra timing que la propia página de `<TransitionSeries>` usa con `fade()` es `springTiming`. El largo de una timing se lee con `getDurationInFrames({ fps })`. ([linearTiming()](https://www.remotion.dev/docs/transitions/timings/lineartiming), [TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries))

La transición no puede durar más que la secuencia anterior ni más que la siguiente. Dos transiciones no pueden ir seguidas. ([TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries))

`fade()` hace entrar la escena nueva por opacidad encima de la que sale. Por defecto la que sale no cambia (`shouldFadeOutExitingScene` es `false`), y eso pide que la que entra sea opaca por completo. Con `shouldFadeOutExitingScene: true` también se desvanece la que sale. La página lo recomienda cuando las escenas no cubren el cuadro. ([fade()](https://www.remotion.dev/docs/transitions/presentations/fade))

Ese fundido es de opacidad de las escenas. No describe el volumen. La página de audio en transiciones muestra cómo envolver una presentación para añadir un efecto sonoro (un whoosh) al entrar; no atenúa la narración de cada escena. ([fade()](https://www.remotion.dev/docs/transitions/presentations/fade), [Transitioning with audio](https://www.remotion.dev/docs/transitions/audio-transitions))

Como las dos escenas están montadas durante el solape, un `<Audio>` dentro de cada una ocupa también ese solape. Las dos narraciones suenan juntas salvo que el volumen se anime aparte, con `interpolate()` sobre `volume`. ([TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries), [Volume and muting](https://www.remotion.dev/docs/audio/volume))

**Fundido dentro de la duración de cada escena, sin solape.** Las escenas siguen en `<Series>` con `offset` 0. `interpolate()` y `useCurrentFrame()` mapean fotogramas a opacidad. El ejemplo de la página sube de 0 a 1 en los primeros fotogramas y baja a 0 al final del rango. Dentro de una secuencia, `useCurrentFrame()` está desplazado para que el arranque de la secuencia sea 0, y `useVideoConfig().durationInFrames` es el fin de esa secuencia en su reloj local. El tiempo del fundido cabe dentro de `durationInFrames` de la escena. El total del short sigue siendo la suma. Esto desvanece la escena contra lo que haya detrás; no es, por sí solo, un fundido cruzado de las dos imágenes, porque la otra escena no está montada. ([interpolate()](https://www.remotion.dev/docs/interpolate), [Sequence](https://www.remotion.dev/docs/sequence), [useVideoConfig()](https://www.remotion.dev/docs/use-video-config))

**Solape escrito a mano.** Un `offset` negativo en `<Series.Sequence>` (y el mismo `offset` en `<TransitionSeries.Sequence>`) adelanta la escena siguiente y la superpone a la anterior, y desplaza el resto. La opacidad de ese tramo se puede animar con `interpolate()`. La geometría es la del solape: el total queda más corto que la suma. La presentación `fade()` no interviene. ([Series](https://www.remotion.dev/docs/series), [TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries), [interpolate()](https://www.remotion.dev/docs/interpolate))

`<TransitionSeries.Overlay>` dibuja hijos encima del corte y no acorta la línea de tiempo. No es un fundido entre las dos escenas. ([TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries))

La página de transiciones lista más presentaciones (deslizamientos, wipes, y otras). El documento cerrado solo tiene corte directo y fundido, así que este mapeo se queda en la ausencia de transición y en `fade()`. ([Transitions](https://www.remotion.dev/docs/transitioning))

## Lo que el spec puede prometer

- Un proyecto es una `<Composition>`: un componente, un `fps`, un `durationInFrames`, un ancho y un alto. El short vertical es ese rectángulo con el alto mayor que el ancho. El proyecto viaja en props JSON. ([Composition](https://www.remotion.dev/docs/composition))
- Cada escena es una secuencia en orden, con `durationInFrames` igual a su duración cuando `playbackRate` es 1. `<Series>` o `<TransitionSeries>` expresan esa lista. ([Series](https://www.remotion.dev/docs/series), [TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries))
- Una imagen se muestra los fotogramas en que `<Img>` está montada, que son los de la escena. ([Img](https://www.remotion.dev/docs/img))
- Un video decodificable se recorta en la composición con `trimBefore` y `durationInFrames`, medidos a la tasa de la composición. Cambiar la duración mueve la salida. No hace falta un archivo ya cortado. ([Trimming, delaying and looping](https://www.remotion.dev/docs/audio/trimming))
- Cero o más textos son capas HTML dentro de la escena. Remotion puede poner el contenido, la posición, el estilo CSS, la fuente cargada y un intervalo `from` + `durationInFrames` dentro de la escena. ([AbsoluteFill](https://www.remotion.dev/docs/absolute-fill), [Using fonts](https://www.remotion.dev/docs/fonts))
- Una narración opcional es un `<Audio>` de la biblioteca (un `src`) dentro de la escena. En un corte sin solape, limitar su `durationInFrames` al tramo de la escena hace que termine con ella y no entre en la siguiente. ([Audio](https://www.remotion.dev/docs/media/audio), [Series](https://www.remotion.dev/docs/series))
- El corte directo es el encadenado de `<Series>` con `offset` 0. ([Series](https://www.remotion.dev/docs/series))
- El fundido se puede expresar. Remotion ofrece la forma con solape, que acorta el total y mantiene la duración declarada de cada escena, y la forma sin solape, que gasta fotogramas dentro de cada `durationInFrames` y deja el total igual a la suma. También ofrece el solape por `offset` negativo con la opacidad animada a mano. La duración del fundido, en la forma con solape, es un número de fotogramas (`linearTiming`) u otra timing cuya longitud se lee con `getDurationInFrames({ fps })`, y no puede superar a ninguna de las dos escenas. ([TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries), [linearTiming()](https://www.remotion.dev/docs/transitions/timings/lineartiming), [interpolate()](https://www.remotion.dev/docs/interpolate))

## Lo que Remotion no cubre

Remotion no elige el modelo de campos del texto, ni la duración del fundido, ni si el fundido se superpone o se descuenta. Esas tres preguntas siguen abiertas. Las formas de arriba las pueden expresar cuando se cierren.

Otras cosas que la composición no resuelve por su cuenta:

- El audio de un `<Video>` suena salvo `muted` o `volume` 0. Silenciar el medio visual es una decisión del documento, no un comportamiento de «medio visual». ([Video](https://www.remotion.dev/docs/media/video), [Volume and muting](https://www.remotion.dev/docs/audio/volume))
- `fade()` no hace un fundido de la narración. En la forma con solape, las dos narraciones coinciden en el tiempo si cada una vive dentro de su escena. Atenuarlas es otro `volume` animado. En la forma sin solape, cada audio sigue el rango de su secuencia y no coincide con el otro. ([fade()](https://www.remotion.dev/docs/transitions/presentations/fade), [TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries), [Volume and muting](https://www.remotion.dev/docs/audio/volume))
- `objectFit` del video parte de `contain`, que puede dejar bandas. Llenar el vertical recortando es `cover`. La imagen se encaja por CSS del `<img>`, no por esa prop. ([Video](https://www.remotion.dev/docs/media/video), [Img](https://www.remotion.dev/docs/img))
- Si el archivo de video termina antes del rango pedido, queda el último fotograma durante el resto de la escena. ([Video](https://www.remotion.dev/docs/media/video))
- La serie no fija sola `durationInFrames` de la composición. Con fundidos que se solapan, ese largo es la suma de las escenas menos la suma de las transiciones, no la suma de las escenas. ([TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries), [Variable duration and dimensions](https://www.remotion.dev/docs/dynamic-metadata))
- Un GIF no se muestra como una imagen quieta a través de `<Img>`. ([Img](https://www.remotion.dev/docs/img))
- La premisa de Remotion sirve para este documento. Ninguna de las piezas cerradas queda sin una forma en la composición.

## Dónde sigue haciendo falta FFmpeg

Recortar un video o un audio que la composición puede decodificar no es un paso previo. `<Video>` extrae fotogramas con Mediabunny. `<Audio>` extrae el audio con Mediabunny en lugar de FFmpeg. El rango lo eligen `trimBefore` y `durationInFrames`. ([Video](https://www.remotion.dev/docs/media/video), [Audio](https://www.remotion.dev/docs/media/audio), [Trimming, delaying and looping](https://www.remotion.dev/docs/audio/trimming))

Los contenedores que Mediabunny declara para esos dos componentes incluyen `.mp4`, `.m4v`, `.m4a`, `.mov`, `.mkv`, `.webm`, `.ogg`, `.mp3`, `.wav`, `.aac`, `.flac`, `.ts` y HLS `.m3u8` (VOD). Los códecs de video de esa tabla son H.264, H.265, VP8, VP9, AV1 y ProRes. Los de audio incluyen AAC, Opus, MP3, Vorbis, FLAC y PCM, y también AC-3, E-AC-3 y DTS. ProRes, AC-3, E-AC-3 y DTS no vienen activados: hay que registrar el decodificador. La tabla de la misma página dice qué códec cabe en qué contenedor. ([Supported formats and codecs by Mediabunny](https://www.remotion.dev/docs/mediabunny/formats), [Supported media](https://www.remotion.dev/docs/media/support))

H.265 no se decodifica con `<Video>` de `@remotion/media` en el render de servidor, porque Chrome Headless Shell no tiene HEVC en modo headless. Si `<Video>` no puede decodificar, el respaldo es `<OffthreadVideo>`. Ese componente, durante el render, extrae el fotograma fuera del navegador con FFmpeg. Los códecs que su página lista son H.264, H.265, VP8, VP9, AV1 y ProRes. El audio que no puede decodificar `<Audio>` cae a `<Html5Audio>`, no a un extracto con FFmpeg. ([Supported formats and codecs by Mediabunny](https://www.remotion.dev/docs/mediabunny/formats), [OffthreadVideo](https://www.remotion.dev/docs/offthreadvideo), [Audio](https://www.remotion.dev/docs/media/audio))

Una imagen que el navegador puede mostrar entra por `<Img>`, que espera la carga y renderiza el fotograma. Ahí no interviene FFmpeg. El tope que Remotion hereda de Chrome es `2^29` píxeles. ([Img](https://www.remotion.dev/docs/img))

La preparación que la composición no hace es convertir un archivo que ni Mediabunny, ni el respaldo, pueden leer. FFmpeg es un conversor de medios: lee entradas, puede filtrarlas y transcodificarlas, y escribe salidas. El ejemplo de la documentación es re-codificar `input.avi` a `output.mp4`. Remotion reparte un binario de la línea 7.1 con `npx remotion ffmpeg`, limitado a los códecs que Remotion soporta en esa herramienta: H.264, H.265, VP8, VP9 y ProRes. Su ejemplo convierte un video en un audio. Un archivo fuera de ese conjunto no lo cubre ese binario; lo cubre un FFmpeg completo, que es el que describe ffmpeg.org. ([ffmpeg Documentation](https://ffmpeg.org/ffmpeg.html), [npx remotion ffmpeg](https://www.remotion.dev/docs/cli/ffmpeg))

Dos límites más, que no son un pre-corte y no eligen el fundido:

- En `.mkv` y `.webm`, extraer el audio de un punto obliga a decodificar todo el audio anterior, porque el contenedor solo guarda tiempos al milisegundo. Para un render distribuido, la propia documentación prefiere `.mp4`, `.mov` o `.m4a`. Eso es una preferencia de contenedor, no una transcodificación obligatoria para un render local. ([Supported media](https://www.remotion.dev/docs/media/support))
- Escribir el archivo del short no lo hace el árbol de la composición. El render de servidor codifica los fotogramas con FFmpeg mientras Chromium sigue renderizando, y `renderMedia()` expone el comando de FFmpeg (`ffmpegOverride`, y el bitrate con la sintaxis de `-b:v`). Eso es el servicio de render, que este mapa deja fuera del spec del documento. ([Parallel encoding](https://www.remotion.dev/docs/parallel-encoding), [renderMedia()](https://www.remotion.dev/docs/renderer/render-media))
