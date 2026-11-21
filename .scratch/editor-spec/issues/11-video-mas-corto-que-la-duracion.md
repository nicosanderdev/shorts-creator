# Qué pasa si el video no alcanza la duración

Type: grilling
Status: resolved

## Question

En el modelo cerrado, la duración de una escena de video es el recorte: la entrada más esa duración es la salida. Remotion no acorta la escena cuando el archivo se termina antes. El último fotograma sigue en pantalla hasta cumplir la duración pedida.

Hay que decidir qué hace el editor en ese caso: impide una duración más larga que el archivo, o la acepta y el último fotograma se queda. Cambiar la duración sigue moviendo la salida cuando el archivo alcanza. La duración es siempre mayor que cero. Si esta decisión la deja más corta, cada fundido vecino que ya no cabe baja hasta la escena más corta del corte, como quedó en [Cuánto dura el fundido](05-duracion-del-fundido.md).

## Comments

La duración de una escena de video es el pedazo que se usa del archivo, de la entrada a la salida. Si la persona pide un pedazo más largo que el archivo, ese pedazo no existe.

Congelar el último fotograma rellenaría el hueco con una imagen quieta. La escena diría que dura más de lo que el video tiene. En un short eso se ve como un trabón, y rompe la idea de que la duración es el largo del recorte. Repetir el video en bucle sería otra regla, y este spec no la tiene.

Por eso el recorte se frena en el final del archivo.

Si la persona alarga la duración y el archivo no alcanza, el editor no cambia nada: la duración anterior sigue. Es el mismo gesto que ya tiene el fundido cuando alguien pide un tiempo que no cabe.

El otro caso no lo pide la persona como un número nuevo. Llega al reemplazar el video por uno más corto. Ahí la entrada vuelve al inicio, que ya estaba cerrado, y la duración baja hasta el largo de ese archivo. La escena queda más corta. Los textos y la narración siguen en ella y terminan cuando ella termina. Cada fundido de al lado que ya no cabe baja hasta la escena más corta del corte, y ese pasa a ser su tiempo. Alargar la escena después no devuelve el tiempo que el fundido perdió.

Un video que no dura nada no puede ser el medio visual. No se añade una escena con él y no se reemplaza con él. La escena queda como estaba.

## Answer

El recorte no pasa del final del archivo. La escena no se queda en el último fotograma para completar la duración, ni el video se repite.

La duración sigue siendo mayor que cero. Pedir cero se niega y la duración anterior sigue. Pedir una duración que sacaría la salida del archivo se niega igual, y la duración anterior sigue. Los fundidos no se tocan. Cuando el archivo sí alcanza, cambiar la duración mueve la salida y la entrada se queda donde está.

Al reemplazar por un video que no cubre la duración que la escena ya tenía, la entrada queda al inicio de ese archivo y la duración pasa a ser el largo del archivo. Los textos y la narración se conservan y terminan con la escena. Cada fundido vecino que ya no cabe baja hasta la escena más corta del corte. Alargar después no lo restaura.

Un video sin duración positiva no entra como medio visual. Añadir o reemplazar con él se niega, y la escena queda como estaba. El medio puede seguir en la biblioteca.

Una imagen no tiene este tope: su duración es cuánto se muestra, no un tramo de un archivo. **Recorte** en `CONTEXT.md` ahora dice que no pasa del final del archivo.
