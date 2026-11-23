# El medio de la biblioteca en el render

## Pregunta

La biblioteca guarda cada medio con `URL.createObjectURL`: el `src` es un `blob:` de este navegador. Si ese `blob:` vale como `src` de `<Video>` y de `<Audio>` de `@remotion/media` cuando el archivo lo escribe `renderMediaOnWeb()`.

La narración termina con la escena. Qué hace ese render con el audio premontado: `premountFor` y `postmountFor` en `<Sequence>`. Si ese tramo entra en la mezcla del archivo, o si solo monta el elemento antes y después sin meterlo en el audio codificado.

Este informe no elige una forma de producir el archivo.

## Fuentes

Páginas y código leídos el 23 de noviembre de 2026. La documentación es la de remotion.dev. El código es el de `main` en [remotion-dev/remotion](https://github.com/remotion-dev/remotion), revisión `2167ef932b0eaec54f046e18f1700015deb15b48`, commit del 23 de noviembre de 2026. Las páginas de Remotion no imprimen fecha de revisión. Para `blob:` se leyeron el borrador vivo de File API, el de Fetch y las páginas de MDN que los citan. No se usaron artículos de terceros.

- [Video (`@remotion/media`)](https://www.remotion.dev/docs/media/video)
- [Audio (`@remotion/media`)](https://www.remotion.dev/docs/media/audio)
- [Sequence](https://www.remotion.dev/docs/sequence)
- [Premounting](https://www.remotion.dev/docs/player/premounting)
- [v5.0 Migration](https://www.remotion.dev/docs/5-0-migration)
- [prefetch()](https://www.remotion.dev/docs/prefetch)
- [URL.createObjectURL() (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static)
- [blob: URLs (MDN)](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/blob)
- [File API, blob URLs](https://w3c.github.io/FileAPI/#url)
- [Fetch, scheme fetch](https://fetch.spec.whatwg.org/#scheme-fetch)

## El `blob:` como `src`

### Lo que dicen las páginas

`src` de `<Video>` es la URL del video. Puede ser una URL remota o un archivo local con `staticFile()`. Una URL remota tiene que permitir CORS; si no, en el render de servidor se intenta el respaldo a `<OffthreadVideo>`. `src` de `<Audio>` dice lo mismo, con respaldo a `<Html5Audio>` en el servidor. Ninguna de las dos páginas nombra `blob:`. ([Video](https://www.remotion.dev/docs/media/video), [Audio](https://www.remotion.dev/docs/media/audio))

`prefetch()` puede convertir un recurso en un `blob:` con `URL.createObjectURL()`. La página dice que, si se pasa la URL original a `<Video>`, `<Audio>`, `<Img>` o a las etiquetas de `remotion` y el recurso ya está descargado, esos componentes usan el Blob URL. En un entorno de render, `waitUntilDone()` devuelve el mismo `src` que se le pasó. Esa página habla del Player y del contenido del blob (el tipo que pierde la extensión, y Safari). No habla de `renderMediaOnWeb()`. ([prefetch()](https://www.remotion.dev/docs/prefetch))

### Lo que hace el código en el render

`<Video>` y `<Audio>` exigen que `src` sea un string. Si no lo es, lanzan `TypeError`. No hay otra comprobación del esquema. (`InnerVideo` en [`packages/media/src/video/video.tsx`](https://github.com/remotion-dev/remotion/blob/2167ef932b0eaec54f046e18f1700015deb15b48/packages/media/src/video/video.tsx), `AudioInner` en [`packages/media/src/audio/audio.tsx`](https://github.com/remotion-dev/remotion/blob/2167ef932b0eaec54f046e18f1700015deb15b48/packages/media/src/audio/audio.tsx))

Con el entorno de render, `<Video>` pinta `VideoForRendering` y `<Audio>` pinta `AudioForRendering`. Los dos pasan ese string a `extractFrameViaBroadcastChannel`. (`InnerVideo`, `AudioInner`)

`createScaffold`, que arma el árbol de `renderMediaOnWeb()`, pone en el contexto `isRendering: true` e `isClientSideRendering: true`. (`createScaffold` en [`packages/web-renderer/src/create-scaffold.tsx`](https://github.com/remotion-dev/remotion/blob/2167ef932b0eaec54f046e18f1700015deb15b48/packages/web-renderer/src/create-scaffold.tsx))

Si `isClientSideRendering` es verdadero, `extractFrameViaBroadcastChannel` no usa el canal de otra pestaña: extrae el medio en este realm y llama a `extractFrameAndAudio` con el mismo `src`. (`extractFrameViaBroadcastChannel` en [`packages/media/src/video-extraction/extract-frame-via-broadcast-channel.ts`](https://github.com/remotion-dev/remotion/blob/2167ef932b0eaec54f046e18f1700015deb15b48/packages/media/src/video-extraction/extract-frame-via-broadcast-channel.ts))

`extractFrameAndAudio` pide el sink con ese `src` tanto si pide cuadro como si pide audio. `makeSinks` construye `new UrlSource(src, { fetchFn })`. `fetchFn` es `makeOfflineMediaFetch`, y esa función llama a `fetch(url)`. (`extractFrameAndAudio` en [`packages/media/src/extract-frame-and-audio.ts`](https://github.com/remotion-dev/remotion/blob/2167ef932b0eaec54f046e18f1700015deb15b48/packages/media/src/extract-frame-and-audio.ts), `makeSinks` en [`packages/media/src/video-extraction/get-frames-since-keyframe.ts`](https://github.com/remotion-dev/remotion/blob/2167ef932b0eaec54f046e18f1700015deb15b48/packages/media/src/video-extraction/get-frames-since-keyframe.ts), `makeOfflineMediaFetch` en [`packages/media/src/offline-media-fetch.ts`](https://github.com/remotion-dev/remotion/blob/2167ef932b0eaec54f046e18f1700015deb15b48/packages/media/src/offline-media-fetch.ts))

`usePreload`, que sustituye un `src` por el `blob:` de `prefetch()`, está en `VideoForPreview` y en `AudioForPreview`. No está en `VideoForRendering` ni en `AudioForRendering`. En el render, el string que llega es el que se escribió en `src`.

### El test que pasa un `blob:` a `<Video>`

El test `renders a partial frame range with video and pitch shifts Video audio` hace un `renderMediaOnWeb()`, toma el blob del resultado, crea `src` con `URL.createObjectURL` y vuelve a llamar a `renderMediaOnWeb()` con `<Video src={src} />`. Después lee la pista de audio del archivo y comprueba que el tono desplazado está en las muestras. Al terminar revoca la URL. ([`packages/web-renderer/src/test/pitch-shift-audio.test.tsx`](https://github.com/remotion-dev/remotion/blob/2167ef932b0eaec54f046e18f1700015deb15b48/packages/web-renderer/src/test/pitch-shift-audio.test.tsx))

Ese `blob:` vale como `src` de `<Video>` en `renderMediaOnWeb()`: el paquete lo usa y espera el audio de ese video en el archivo.

`<Audio>` recorre el mismo `extractFrameViaBroadcastChannel` y el mismo `makeSinks`. En los tests de `renderMediaOnWeb` que usan `<Audio>`, el `src` de la narración de prueba es un `data:audio/wav;base64,...` que arma `makeToneWav`, no un `blob:`. (`makeToneWav` en [`packages/web-renderer/src/test/fixtures/pitch-shift-audio.tsx`](https://github.com/remotion-dev/remotion/blob/2167ef932b0eaec54f046e18f1700015deb15b48/packages/web-renderer/src/test/fixtures/pitch-shift-audio.tsx))

### Qué exige `blob:` para que `fetch` lo lea

`URL.createObjectURL()` devuelve una URL de esquema `blob:` que apunta al `Blob`. ([URL.createObjectURL() (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static), [blob: URLs (MDN)](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/blob))

Fetch, en el esquema `blob`, busca la entrada de esa URL. Si el método no es `GET`, o si la entrada es nula, devuelve un error de red. Si la entrada existe, responde con el cuerpo del blob. También atiende `Range`. ([Fetch, scheme fetch](https://fetch.spec.whatwg.org/#scheme-fetch))

File API: una URL `blob:` solo se puede leer desde un entorno cuya clave de almacenamiento coincide con la del entorno que la creó. El origen, mientras no esté revocada, es el del entorno creador. Si se revoca y después se desreferencia, el agente de usuario actúa como si hubiera un error de red. Las entradas se quitan al descargar el documento que las creó. ([File API, blob URLs](https://w3c.github.io/FileAPI/#url))

El render del navegador extrae en el realm de la llamada. Un `blob:` creado en ese mismo entorno, y todavía en el almacén, es una URL que `fetch` puede leer. Uno revocado, o creado en otro entorno de almacenamiento, es un error de red según esas dos especificaciones. Si `<Video>` o `<Audio>` no pueden leer el medio, el render en el cliente falla: las páginas dicen que ahí no hay respaldo, sea cual sea el valor que devuelva `onError`. ([Video](https://www.remotion.dev/docs/media/video), [Audio](https://www.remotion.dev/docs/media/audio))

## El audio premontado

### Lo que dicen las páginas

Premounting monta un componente antes de que aparezca, oculto, esperando en su primer fotograma. Aplica en el Player y en Studio, y no tiene efecto durante el render. El defecto de Studio es 2 segundos desde la v4.0.535. El del Player es 0 segundos en v4 y 2 en v5. Un `premountFor` explícito manda sobre ese defecto. ([Premounting](https://www.remotion.dev/docs/player/premounting), [v5.0 Migration](https://www.remotion.dev/docs/5-0-migration))

`postmountFor` mantiene el componente montado después de que terminó, para buscar hacia atrás o reproducir. Esa sección no habla del archivo codificado. ([Premounting](https://www.remotion.dev/docs/player/premounting))

La página de `<Sequence>` describe `premountFor` como premontar durante unos fotogramas, con el mismo defecto de Studio y de Player, y `postmountFor` como lo mismo después del final. No dice qué hace `renderMediaOnWeb()` con ese tramo. ([Sequence](https://www.remotion.dev/docs/sequence))

En `<Audio>`, `premountFor` monta el audio esos fotogramas antes de `from`, para que pueda amortiguar, y `postmountFor` lo deja montado después de la duración. La página remite a Premounting. ([Audio](https://www.remotion.dev/docs/media/audio))

### Lo que hace `renderMediaOnWeb()`

`usePremounting` calcula `premountingActive` y `postmountingActive` solo si `environment.isRendering` es falso. El comentario del símbolo dice que el premontaje está desactivado durante el render. Con `isRendering`, las dos banderas quedan en falso, haya o no un `premountFor` o un `postmountFor` explícito, y haya o no segundos de defecto. (`usePremounting` en [`packages/core/src/use-premounting.ts`](https://github.com/remotion-dev/remotion/blob/2167ef932b0eaec54f046e18f1700015deb15b48/packages/core/src/use-premounting.ts))

`Sequence` solo entra en `PremountedPostmountedSequence` si `layout` no es `"none"` y `isRendering` es falso. Ahí aplica el `premountFor` explícito o el defecto en segundos, y también `postmountFor`. En el render usa `RegularSequence`. (`SequenceRefForwardingFunction` en [`packages/core/src/Sequence.tsx`](https://github.com/remotion-dev/remotion/blob/2167ef932b0eaec54f046e18f1700015deb15b48/packages/core/src/Sequence.tsx))

`RegularSequence` considera visible el contenido cuando el fotograma cae en `[from, from + duración)`. Ese cálculo no suma `premountFor` ni `postmountFor`. Fuera de ese tramo, y con la actividad de Studio apagada, los hijos son `null`. La actividad de Studio pide `isStudio` y niega `isRendering`. El andamio del render pone las dos cosas al revés: `isStudio: false`, `isRendering: true`. (`RegularSequenceRefForwardingFunction` y `RegularSequenceContent` en el mismo archivo, `createScaffold`)

`<Audio>` envuelve su secuencia en un `Freeze` activo solo si `isPremountingOrPostmounting`. Durante el render esa condición es falsa. La secuencia interna lleva `layout="none"`, así que tampoco toma el camino de premontaje de `Sequence`. El hijo de render, `AudioForRendering`, solo está montado mientras la secuencia lo considera visible. (`AudioInner`)

### La mezcla

`AudioForRendering`, mientras está montado y el audio se usa, extrae el tramo del fotograma actual y, si hay muestras y el volumen es mayor que 0, registra un asset `inline-audio`. Al desmontarse, lo da de baja. (`AudioForRendering` en [`packages/media/src/audio/audio-for-rendering.tsx`](https://github.com/remotion-dev/remotion/blob/2167ef932b0eaec54f046e18f1700015deb15b48/packages/media/src/audio/audio-for-rendering.tsx))

En cada fotograma, `renderMediaOnWeb()` recoge los assets montados y se los pasa a `audioMixer.addFrame`. `createAudioMixer` se queda con los de tipo `inline-audio` y los suma en el bloque de ese fotograma. (`internalRenderMediaOnWeb` en [`packages/web-renderer/src/render-media-on-web.tsx`](https://github.com/remotion-dev/remotion/blob/2167ef932b0eaec54f046e18f1700015deb15b48/packages/web-renderer/src/render-media-on-web.tsx), `createAudioMixer` en [`packages/web-renderer/src/audio.ts`](https://github.com/remotion-dev/remotion/blob/2167ef932b0eaec54f046e18f1700015deb15b48/packages/web-renderer/src/audio.ts))

El tramo de `premountFor` y el de `postmountFor` no montan `AudioForRendering` en este render, así que no registran `inline-audio` y no entran en la suma. El audio que se codifica es el de los `<Audio>` y `<Video>` montados dentro de su `from` y su duración.

## Lo que sigue en silencio

Las páginas de `src` siguen sin escribir `blob:`. El test que sí lo pasa a `renderMediaOnWeb()` usa `<Video>`. No hay un test que pase un `blob:` a `<Audio>`. El código de `<Audio>` no tiene una rama distinta de esquema; tampoco hay una frase, en la página o en un test, que diga que un `blob:` de audio se codificó.

`prefetch()` documenta el tipo de contenido del blob para la reproducción, sobre todo en Safari. Esa página no dice qué hace `renderMediaOnWeb()` si el `Blob` de `createObjectURL` llega sin tipo. El test del `blob:` en `<Video>` usa el blob que devolvió un render anterior y no habla del tipo.

La sección de postmontaje dice para qué sirve tener el componente montado después del final. No dice, ella sola, que ese tramo quede fuera del archivo. Eso lo dice el código de `usePremounting`, de `Sequence` y del mezclador, con `isRendering` verdadero.
