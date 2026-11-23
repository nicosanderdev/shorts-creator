# 03 — Reproducir y pausar

**What to build:** Reproducir toma el short desde el momento del recorrido, con la narración, y el recorrido avanza. Al llegar al final se detiene y el recorrido queda ahí. Pausar detiene la vista previa, deja el recorrido donde está y calla la narración. No hay bucle.

Mientras corre, Pausar está listo y Reproducir no. Renderizar sigue listo. Al detenerse, sola o con Pausar, solo Reproducir está listo entre los dos. Con el recorrido al final, y también sin escenas, Reproducir sigue listo y el pulso se niegue, sin un texto.

Mover el recorrido mientras corre pausa al primer movimiento que cambia el momento. El cuadro sigue ese momento, en silencio, fundido incluido. Al soltar, queda pausada ahí. Un gesto que no cambia el momento no pausa. Elegir una escena mientras corre lleva el recorrido al inicio de esa escena y pausa. El proyecto queda igual.

Durante un fundido se ven las dos imágenes y los textos de las dos escenas, y se oyen las dos narraciones. La pista del medio visual no se oye. La narración termina con la escena y no se repite. En pausa, y mientras se mueve el recorrido, no se oye.

**Blocked by:** 02 — Vista previa muestra el short en pausa

**Status:** done

- [x] Reproducir toma el short desde el recorrido, con la narración, y el recorrido avanza
- [x] Al llegar al final se detiene, el recorrido queda ahí y no hay bucle
- [x] Pausar deja el recorrido donde está y calla la narración
- [x] Mientras corre, Pausar está listo, Reproducir no, y Renderizar sigue listo
- [x] Al detenerse, sola o con Pausar, solo Reproducir está listo entre los dos
- [x] Al final, y sin escenas, Reproducir sigue listo y el pulso se niega, sin un texto
- [x] Mover el recorrido mientras corre pausa al primer movimiento que cambia el momento
- [x] En ese movimiento el cuadro sigue el momento, en silencio, fundido incluido, y al soltar queda pausada
- [x] Un gesto que no cambia el momento no pausa
- [x] Elegir una escena mientras corre lleva el recorrido a su inicio, pausa y deja el proyecto igual
- [x] Durante el fundido se ven las dos imágenes y los textos de las dos escenas, y se oyen las dos narraciones
- [x] La pista del medio visual no se oye, la narración termina con la escena y no se repite
- [x] En pausa, y al mover el recorrido, la narración no se oye
