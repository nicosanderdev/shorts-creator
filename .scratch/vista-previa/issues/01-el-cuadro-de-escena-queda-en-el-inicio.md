# 01 — El cuadro de Escena queda en el inicio

**What to build:** En Escena, el cuadro mide 120 px de ancho, conserva la proporción del short y queda al lado de los datos. Muestra el inicio de la escena elegida, sola y a opacidad plena: en un video o un GIF, el fotograma de la entrada, quieto; en una imagen, la imagen; con el encaje de siempre y los textos de la escena. El recorrido no lo mueve, y la escena vecina no aparece aunque se esté editando el fundido. Sin escena elegida, el cuadro no tiene nada que mostrar. Escena ya no tiene recorrido.

Arriba de los textos, el bloque Fundido elige corte directo o fundido y, si es fundido, el tiempo. Es el corte con la escena siguiente. En la última escena el bloque no está. El tiempo sigue naciendo en medio segundo o en la escena más corta, se niega en cero y cuando no cabe, y volver a corte directo lo olvida.

La posición y el tamaño del texto se editan en porcentaje del cuadro. Un texto nuevo muestra 50, 50 y 8. El documento guarda la fracción: 50 y 50 es el centro, 8 es ocho centésimos. El tamaño queda por encima de cero. La posición puede caer fuera de 0 a 100. La duración y el tiempo del fundido siguen en segundos.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] El cuadro de Escena mide 120 px de ancho, conserva la proporción del short y queda al lado de los datos
- [ ] Muestra el inicio de la escena elegida, sola y a opacidad plena, con el encaje y los textos
- [ ] En un video o un GIF ese cuadro es el fotograma de la entrada, quieto; en una imagen, la imagen
- [ ] El recorrido no está en Escena y no mueve ese cuadro
- [ ] Un fundido no trae la escena vecina a ese cuadro, aunque el bloque se esté editando
- [ ] Sin escena elegida, el cuadro no tiene nada que mostrar
- [ ] El bloque Fundido está arriba de los textos, elige corte directo o fundido y, si es fundido, el tiempo
- [ ] El bloque es el corte con la escena siguiente, y en la última escena no está
- [ ] El fundido nace en medio segundo, o en la escena más corta si esa dura menos
- [ ] Pedir cero, o más tiempo del que cabe, se niega y sigue el tiempo anterior
- [ ] Volver a corte directo olvida el tiempo
- [ ] Un texto nuevo muestra 50, 50 y 8, y el documento guarda el centro y ocho centésimos de la altura
- [ ] Pedir un tamaño de cero o menos se niega y sigue el tamaño anterior
- [ ] La posición puede caer fuera de 0 a 100
- [ ] La duración de la escena y el tiempo del fundido siguen en segundos
