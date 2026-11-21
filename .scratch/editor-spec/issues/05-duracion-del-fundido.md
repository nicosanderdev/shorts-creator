# Cuánto dura el fundido

Type: grilling
Status: resolved
Blocked by: 06

## Question

La transición pertenece al corte entre dos escenas, y sus valores son corte directo y fundido. El corte directo no ocupa tiempo. Falta decidir el fundido.

- Si dura un tiempo fijo o lo elige la persona.
- Si ese tiempo se superpone a las dos escenas o se descuenta de su duración.

[Cómo se mapea un proyecto a Remotion](06-mapeo-remotion.md) ya describió las formas, sin elegir:

- Con solape, las dos escenas se montan juntas, cada una conserva su duración y el total del short se acorta en la duración del fundido. Ese fundido no puede durar más que ninguna de las dos escenas. Las dos narraciones coinciden en ese tramo, salvo que el volumen se anime aparte. El volumen sigue en la niebla; acá solo hay que decir si ese solape de narración se acepta o si empuja a la otra forma.
- Sin solape, el tiempo sale de la duración de cada escena y el total sigue siendo la suma. Las narraciones no coinciden.

Al cerrar, afinar **Transición** en `CONTEXT.md` si hace falta.

## Comments

Ronda 1, las dos recomendaciones. La persona elige el tiempo de cada fundido. El fundido solapa las dos escenas: cada una conserva su duración y el short se acorta en ese tiempo. Las dos narraciones comparten el tramo. El volumen queda fuera. **Narración** en `CONTEXT.md` ya dice que termina con su escena y que, durante el fundido, los dos audios comparten ese tiempo.

Ronda 2, las siete recomendaciones. Cada fundido guarda su tiempo. Al pasar a fundido nace en medio segundo. Ese tiempo es siempre mayor que cero. Volver a corte directo lo olvida, y un fundido nuevo vuelve a nacer en medio segundo. Una escena puede estar en dos fundidos a la vez. Pedir un tiempo mayor que la escena más corta del corte se niega y el tiempo anterior sigue. Los textos de las dos escenas se ven en el solape. **Transición** en `CONTEXT.md` ya dice que el fundido tiene un tiempo propio del corte y que las dos escenas se solapan durante ese tiempo.

Ronda 3, las dos recomendaciones. Acortar una escena siempre se aplica, y cada fundido que ya no cabe baja hasta esa duración: ese pasa a ser su tiempo. Si al pasar a fundido la escena más corta dura menos de medio segundo, el fundido nace con la duración de esa escena.

## Answer

La persona elige el tiempo de cada fundido. **Duración** es la de la escena, siempre mayor que cero. El fundido tiene un tiempo propio de ese corte.

Durante ese tiempo las dos escenas se solapan: el final de la que sale y el inicio de la que entra. Cada una conserva su duración. El short dura la suma de las duraciones menos la suma de los tiempos de fundido. En ese tramo se ven las dos imágenes y los textos de las dos escenas, y se oyen las dos narraciones. El volumen queda fuera de esta decisión.

Al pasar de corte directo a fundido, el tiempo nace en medio segundo, o en la duración de la escena más corta del corte si esa dura menos. El tiempo es mayor que cero y puede llegar hasta la escena más corta, inclusive. Pedir más se niega y el tiempo anterior sigue. Pedir cero se niega: eso es un corte directo.

Volver a corte directo olvida el tiempo. Un fundido nuevo vuelve a nacer con la misma regla.

Una escena puede estar en dos fundidos a la vez. Acortar su duración siempre se aplica. Cada fundido vecino que ya no cabe baja hasta la escena más corta del corte, y ese pasa a ser su tiempo. Alargar la escena después no lo restaura.

Si el par se separa, se invierte o se elimina una escena, el corte desaparece con su tiempo. Estas operaciones no crean un fundido.

**Narración**, **Transición** y **Duración** en `CONTEXT.md` quedaron afinados con esto.
