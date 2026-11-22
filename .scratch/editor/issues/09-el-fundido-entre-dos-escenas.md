# 09 — El fundido entre dos escenas

**What to build:** La persona elige, en el corte con la escena siguiente, entre corte directo y fundido, y pone el tiempo de cada fundido. Durante ese tiempo las dos escenas se solapan: se ven los dos medios y los textos de las dos, se oyen las dos narraciones y el short se acorta. Un tiempo que no cabe se niega. Acortar una escena baja los fundidos vecinos que ya no entran.

**Blocked by:** 08 — La duración y el reemplazo del medio

**Status:** ready-for-agent

- [ ] La persona pasa un corte de corte directo a fundido y elige el tiempo de ese corte
- [ ] Al pasar a fundido, el tiempo nace en medio segundo, o en la duración de la escena más corta del corte si esa dura menos
- [ ] El tiempo es mayor que cero y puede llegar hasta la escena más corta, inclusive
- [ ] Pedir más se niega y el tiempo anterior sigue
- [ ] Pedir cero se niega; volver a corte directo es lo que quita el fundido
- [ ] Volver a corte directo olvida el tiempo, y un fundido nuevo vuelve a nacer con la misma regla
- [ ] Una escena puede estar en dos fundidos a la vez
- [ ] Durante el fundido se solapan el final de la escena que sale y el inicio de la que entra
- [ ] Cada escena conserva su duración
- [ ] La barra muestra la suma de las duraciones menos la suma de los tiempos de fundido
- [ ] En el solape se ven los dos medios y los textos de las dos escenas, y se oyen las dos narraciones
- [ ] En el solape no se oye ninguna pista de video
- [ ] Acortar una escena siempre se aplica
- [ ] Cada fundido vecino que ya no cabe baja hasta la escena más corta de ese corte, y ese pasa a ser su tiempo
- [ ] Alargar la escena después no restaura el tiempo que el fundido perdió
- [ ] Eso vale tanto si el acortamiento viene de cambiar la duración como si viene de reemplazar por un video más corto
- [ ] Añadir una escena no crea un fundido; el corte nuevo nace en corte directo
