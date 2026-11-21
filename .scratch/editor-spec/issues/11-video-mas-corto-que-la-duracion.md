# Qué pasa si el video no alcanza la duración

Type: grilling
Status: open

## Question

En el modelo cerrado, la duración de una escena de video es el recorte: la entrada más esa duración es la salida. Remotion no acorta la escena cuando el archivo se termina antes. El último fotograma sigue en pantalla hasta cumplir la duración pedida.

Hay que decidir qué hace el editor en ese caso: impide una duración más larga que el archivo, o la acepta y el último fotograma se queda. Cambiar la duración sigue moviendo la salida cuando el archivo alcanza. La duración es siempre mayor que cero. Si esta decisión la deja más corta, cada fundido vecino que ya no cabe baja hasta la escena más corta del corte, como quedó en [Cuánto dura el fundido](05-duracion-del-fundido.md).
