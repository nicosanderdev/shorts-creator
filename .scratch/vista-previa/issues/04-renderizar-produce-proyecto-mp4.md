# 04 — Renderizar produce Proyecto.mp4

**What to build:** Renderizar produce, en este navegador, el archivo de la composición que muestra Vista previa y lo descarga. Sin escenas se niega: no hay espera ni archivo, se lee «No hay escenas» y el editor sigue usable.

Con escenas, si la vista previa iba reproduciéndose, se pausa y el recorrido queda donde está. El editor espera: no se cambia de modo, no se edita el proyecto y no se vuelve a pulsar Renderizar. La vista previa permanece pausada. Se lee «Produciendo el archivo», sin porcentaje y sin ver pasar los fotogramas.

Al terminar, el navegador descarga `Proyecto.mp4`. Si repite el nombre, lo numera él. El texto se va, Vista previa queda lista y no hay un aviso de éxito. El proyecto no cambia. El archivo es vertical, de 1080 por 1920, a 30 fotogramas por segundo, y dura lo que dura el short, fundidos incluidos. Tiene los textos, la narración y el medio visual en silencio. La pista de audio queda, para que la narración se oiga. El video es h264 y el audio es aac, los dos con bitrate medium, a 48000, con un keyframe cada 5 segundos, y la aceleración la elige el navegador. No lleva título ni autor. El comentario es el que pone la función, e incluye «Made with Remotion».

Si no llega a haber archivo, se lee «No se pudo producir el archivo». Si la producción no llegó a arrancar, ese texto aparece directo. El proyecto queda igual y Renderizar se puede volver a pulsar. Un medio que no se puede leer usa ese fallo.

«No hay escenas» y «No se pudo producir el archivo» siguen en Vista previa hasta que la persona sale del modo, aparece una escena o pulsa Renderizar otra vez. «Produciendo el archivo» dura solo mientras se produce. Los tres son texto en ese modo. El editor no avisa de la telemetría ni pide un sí, y no muestra una política de privacidad.

**Blocked by:** 03 — Reproducir y pausar

**Status:** ready-for-agent

- [ ] Sin escenas, Renderizar se niega, no hay espera ni archivo, se lee «No hay escenas» y el editor sigue usable
- [ ] Con escenas, si iba reproduciéndose, se pausa y el recorrido queda donde está
- [ ] Mientras se produce, no se cambia de modo, no se edita, no se vuelve a pulsar Renderizar y la vista previa sigue pausada
- [ ] Se lee «Produciendo el archivo», sin porcentaje y sin ver pasar los fotogramas
- [ ] Al terminar, el navegador descarga `Proyecto.mp4`; si repite el nombre, lo numera él
- [ ] Al terminar, el texto se va, Vista previa queda lista, no hay un aviso de éxito y el proyecto no cambia
- [ ] El archivo es la composición del cuadro: 1080 por 1920, 30 fotogramas por segundo, con la duración del short, los fundidos, los textos y la narración
- [ ] El medio visual va en silencio y la pista de audio del archivo queda
- [ ] El video es h264 y el audio es aac, bitrate medium, 48000, un keyframe cada 5 segundos, y la aceleración la elige el navegador
- [ ] No hay título ni autor, y el comentario es el de la función, con «Made with Remotion»
- [ ] Si no hay archivo, se lee «No se pudo producir el archivo»; si no llegó a arrancar, el texto aparece directo
- [ ] Si falla, el proyecto queda igual y Renderizar se puede volver a pulsar
- [ ] Un medio que no se puede leer usa ese fallo
- [ ] «No hay escenas» y «No se pudo producir el archivo» siguen hasta salir del modo, aparecer una escena o pulsar Renderizar otra vez
- [ ] «Produciendo el archivo» dura solo mientras se produce, y los tres textos están en Vista previa
- [ ] No hay aviso de telemetría, ni un sí, ni una política de privacidad
