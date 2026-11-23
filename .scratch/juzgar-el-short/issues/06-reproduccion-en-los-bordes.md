# Qué hace la reproducción en los bordes

Type: grilling
Status: resolved
Claimed by: sesión de grill

## Question

Reproducir y Pausar ya tienen su centro: Reproducir toma el short entero desde el momento del recorrido, con la narración, y el recorrido avanza; al llegar al final se detiene. Pausar deja el recorrido donde está.

Falta el borde:

- El recorrido ya está al final y la persona pulsa Reproducir.
- La persona mueve el recorrido mientras la vista previa corre.
- La vista previa llega al final sola: qué queda listo entre Reproducir y Pausar.

## Answer

Mientras la vista previa corre, solo Pausar está listo. Al detenerse, sola o con Pausar, el recorrido queda donde está y solo Reproducir está listo.

Al llegar al final, el recorrido queda ahí. Reproducir sigue listo y el pulso se niega. No hay un texto. En un proyecto sin escenas pasa lo mismo: la duración es cero y el recorrido no tiene otro momento.

Mover el recorrido mientras corre pausa al primer movimiento. El cuadro de Vista previa sigue ese momento, en silencio, fundido incluido. Al soltar, queda pausada ahí. Un gesto que no cambia el momento no pausa. Con la vista previa ya detenida, mover el recorrido deja el cuadro en el momento nuevo y sigue pausada.

Elegir una escena en la lista lleva el recorrido al inicio de esa escena y, si estaba corriendo, pausa. El proyecto queda igual.

Reproducir, cuando el recorrido no está al final, toma el short desde ese momento, con la narración.
