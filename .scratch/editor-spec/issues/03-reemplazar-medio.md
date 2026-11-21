# Qué queda al reemplazar el medio visual

Type: grilling
Status: resolved

## Question

Cada escena tiene un solo medio visual, imagen o video. Hay que decidir qué hace reemplazarlo por otro medio de la biblioteca.

- Si una imagen puede pasar a ser video, y un video puede pasar a ser imagen.
- Qué se conserva de la escena: textos, narración y duración.
- Con un video nuevo, cómo se fija el recorte. Con una imagen nueva, qué duración queda.

El modelo de tiempo ya cerrado: en una imagen, la duración es cuánto se muestra; en un video, el recorte (entrada y salida) es la duración, y cambiar la duración mueve la salida.

## Comments

Ronda 1. Reemplazar es un cambio sobre esa escena: sigue en su posición y los cortes de al lado conservan su transición. El medio nuevo es una imagen o un video de la biblioteca, y puede cambiar de clase. Un audio no entra en este reemplazo. **Medio visual** quedó en `CONTEXT.md`.

Ronda 2. Los textos se quedan, con sus datos y su orden. La narración se queda y termina con la escena. Si el medio nuevo es una imagen, la escena conserva su duración. Si es un video, la entrada queda al inicio de ese archivo y el recorte dura lo que ya duraba la escena. Un video más corto que esa duración queda en [Qué pasa si el video no alcanza la duración](11-video-mas-corto-que-la-duracion.md). **Duración** y **Recorte** quedaron en `CONTEXT.md`.

Ronda 3. Elegir otra vez el mismo medio deja la escena como está: en un video, la entrada sigue donde está. La entrada al inicio vale cuando el medio visual pasa a ser otro video. El modelo completo quedó confirmado.

## Answer

Reemplazar cambia el medio visual de esa escena y la deja en su sitio. Los cortes de al lado conservan su transición. El medio anterior sigue en la biblioteca, y las otras escenas que lo usan siguen igual.

El medio nuevo es otra imagen u otro video de la biblioteca, y puede cambiar de clase. Un audio no entra en este reemplazo. Elegir el mismo medio no es un reemplazo: la escena queda como está. En un video, la entrada sigue donde está.

Los textos se quedan, con su contenido, posición, tamaño, color, alineación y orden. La narración se queda y termina cuando termina la escena.

Si el medio nuevo es una imagen, la escena conserva su duración. Una imagen no tiene recorte: si antes había un video, lo que pasa a la imagen es cuánto duraba ese recorte.

Si el medio nuevo es otro video, la entrada queda al inicio de ese archivo y el recorte dura lo que ya duraba la escena. La salida cae ahí. Si ese archivo es más corto que la duración, lo decide [Qué pasa si el video no alcanza la duración](11-video-mas-corto-que-la-duracion.md).

El audio del video, el encaje en el cuadro y la duración con la que nace una escena siguen en sus tickets. **Medio visual**, **Duración** y **Recorte** ya están en `CONTEXT.md`.
