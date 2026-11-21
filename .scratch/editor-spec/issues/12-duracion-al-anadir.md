# Con qué duración y recorte nace la escena

Type: grilling
Status: resolved

## Question

Añadir pone la escena al final y nace con un medio visual de la biblioteca, sin textos y sin narración. El tiempo ya está cerrado: con una imagen, la duración es cuánto se muestra; con un video, el recorte (entrada y salida) es la duración, y cambiar la duración mueve la salida. Falta el valor con el que nace.

- Con una imagen, qué duración tiene la escena al nacer.
- Con un video, dónde queda la entrada y qué duración tiene el recorte inicial.

La duración con la que nace es mayor que cero. Un corte nuevo nace en corte directo; el tiempo del fundido no es esta pregunta. Quedó cerrado en [Cuánto dura el fundido](05-duracion-del-fundido.md).

[Qué queda al reemplazar el medio visual](03-reemplazar-medio.md) decide el medio que sustituye a otro. [Qué pasa si el video no alcanza la duración](11-video-mas-corto-que-la-duracion.md) decide una duración más larga que el archivo. Esta pregunta es solo el alta.

## Comments

Añadir una escena la pone al final, con un medio de la biblioteca, sin textos y sin narración. Faltaba el tiempo con el que aparece.

Tres segundos es un tramo corto, bastante para leer una frase, y más largo que el medio segundo con el que nace un fundido. Así, el corte nuevo puede pasar a fundido sin que el fundido tenga que encogerse a la escena entera. La imagen y el video nacen con el mismo número, y una escena nueva se siente igual venga de una foto o de un video.

Usar el archivo entero sería una trampa: un video de varios minutos nacería como una escena de varios minutos, y esto es un short.

En un video, el pedazo empieza al principio del archivo. No hay un control aparte para elegir otro comienzo. Cambiar la duración después mueve solo el final, y no puede salir del archivo: si no cabe, [Qué pasa si el video no alcanza la duración](11-video-mas-corto-que-la-duracion.md) niega el cambio.

Si el archivo dura menos de tres segundos, la escena nace con el largo del archivo. Un video que no dura nada no puede añadirse.

## Answer

Una imagen nace con una duración de tres segundos. No tiene recorte.

Un video nace con la entrada al inicio del archivo. El recorte dura tres segundos. Si el archivo dura menos, el recorte dura lo que dura el archivo. Si el archivo no tiene duración positiva, la escena no se añade y el proyecto queda como estaba.

No hay una operación para mover la entrada a otro punto. La entrada queda al inicio al nacer, y vuelve al inicio cuando el medio visual pasa a ser otro video. Cambiar la duración mueve la salida, sin pasar del final del archivo.

La escena nace sin textos y sin narración. El corte con la escena anterior, si lo hay, nace en corte directo.
