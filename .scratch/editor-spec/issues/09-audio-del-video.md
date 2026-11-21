# Si se oye el audio del video

Type: grilling
Status: resolved

## Question

Un video de una escena trae su propia pista. En Remotion esa pista suena, salvo que el documento la silencie. La narración es otro audio, el hablado de la escena.

Hay que decidir si el audio del video se oye, si queda siempre en silencio, o si la persona lo elige en el editor. La narración no se mueve de lugar: sigue siendo una por escena, tomada de la biblioteca, y termina con la escena. Durante un fundido las dos escenas se solapan; si el audio del video se oye, comparte ese tramo igual que la narración. Si se oye o no es esta pregunta. El solape ya está cerrado en [Cuánto dura el fundido](05-duracion-del-fundido.md).

## Comments

La pista de un video es el sonido que ya trae el archivo: una voz, música, ruido de fondo. La narración es otra cosa: el audio que la persona pone en la escena, desde la biblioteca.

Si esa pista se oyera, en una escena sonarían a la vez el video y la narración. En un fundido, las dos escenas se pisan, así que sonarían las dos pistas y las dos narraciones. El short quedaría con voces encima de voces.

La recomendación, y el cierre, es apagarla siempre. No hay un interruptor en la escena y el documento no guarda un sí o un no. El medio visual se ve; no se oye. Lo único que se oye de la escena es la narración, si la tiene. En el fundido se oyen solo las dos narraciones, que ya estaba cerrado.

Dejar que la persona lo elija quedaría a medias: el volumen de la narración todavía no se decide, y un interruptor sin volumen no alcanza para mezclar. Oír la pista, o bajarle el volumen, puede volver más adelante. En este spec no entra.

## Answer

La pista del video no se oye. No hay un dato en la escena ni un control para encenderla. Vale para todo video, también para un GIF, al nacer la escena y al reemplazar el medio. Elegir el mismo video no la enciende.

La narración sigue siendo el único audio de la escena. Si no hay narración, la escena no suena. Durante un fundido se oyen las narraciones de las dos escenas, y ninguna pista de video.

El volumen, un audio de narración más corto que la escena y el punto de inicio de esa narración siguen fuera de esta decisión.

**Medio visual** en `CONTEXT.md` ahora dice que el sonido del archivo no se oye en el short.
