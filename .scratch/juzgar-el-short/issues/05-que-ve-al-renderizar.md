# Qué ve la persona al renderizar

Type: grilling
Status: resolved
Claimed by: sesión de grill
Blocked by: 03

## Question

Qué ocurre cuando la persona pulsa Renderizar en Vista previa.

- Un proyecto sin escenas.
- Un proyecto con escenas: qué ve mientras el navegador produce el archivo, si puede seguir editando o reproduciendo, y qué archivo recibe al terminar, con su nombre. Las dos salidas que la investigación encontró son la descarga del blob y el selector de guardado.
- Si producir el archivo falla: qué ve, y qué queda del proyecto.

La forma concreta de producirlo puede seguir abierta. La respuesta tiene que poder cumplirse con lo que la investigación muestre que el navegador sabe hacer.

## Answer

Sin escenas, Renderizar se niega. No hay espera ni archivo. En Vista previa se lee «No hay escenas» y el editor sigue usable.

Con escenas, si la vista previa iba reproduciéndose, se pausa y el recorrido queda donde está. El editor espera: no se cambia de modo, no se edita y no se vuelve a pulsar Renderizar. Se lee «Produciendo el archivo», sin porcentaje y sin ver pasar los fotogramas. Al terminar, el navegador descarga el archivo con el nombre del proyecto, «Proyecto». La extensión la fija el ticket de los parámetros. Si el navegador repite el nombre, lo numera él. El texto se va, Vista previa queda lista y no hay un aviso de éxito. El proyecto no cambia.

Si no llega a haber archivo, se lee «No se pudo producir el archivo». Si la producción no llegó a arrancar, ese texto aparece directo. El proyecto queda igual y Renderizar se puede volver a pulsar.

«No hay escenas» y «No se pudo producir el archivo» siguen en Vista previa hasta que la persona sale del modo, aparece una escena o pulsa Renderizar otra vez. «Produciendo el archivo» dura solo mientras se produce. Los tres son texto en ese modo.
