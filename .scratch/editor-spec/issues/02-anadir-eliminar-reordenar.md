# Qué pasa al añadir, eliminar y reordenar escenas

Type: grilling
Status: resolved

## Question

El proyecto es una lista ordenada de escenas, y la transición vive en el corte entre dos de ellas. Hay que decidir las tres operaciones de estructura.

- Añadir: en qué posición aparece la escena nueva, y si nace ya con un medio visual. El glosario dice que una escena tiene un medio visual; si puede nacer vacía, ese término se actualiza en `CONTEXT.md`.
- Eliminar: qué pasa con los cortes (y sus transiciones) a los lados de la escena que sale. Un proyecto puede quedar sin escenas.
- Reordenar: la transición del corte se queda entre dos posiciones, o viaja con la escena que se mueve.

Duración, recorte, textos, narración y el catálogo de transiciones (corte directo y fundido) ya están cerrados en las notas del mapa. Esta pregunta es solo la estructura de la lista.

## Comments

Ronda 1, las tres recomendaciones. La escena nueva queda al final y nace con un medio visual de la biblioteca. El corte es el par de escenas vecinas en ese orden: sobrevive solo si siguen juntas así, y todo corte nuevo nace en corte directo. El modelo completo quedó confirmado.

## Answer

Añadir pone una escena al final del proyecto. Nace con un medio visual elegido de la biblioteca, sin textos y sin narración. Si la biblioteca no tiene un video o una imagen, no se puede añadir. Si el proyecto no tenía escenas, la nueva queda sola y no hay corte. Si ya había escenas, el corte entre la última y la nueva nace en corte directo.

Eliminar saca la escena con sus textos y su narración. El medio sigue en la biblioteca. Desaparecen los cortes que tocaban a esa escena. Si dos escenas quedan vecinas y antes no lo eran, ese corte nace en corte directo. Eliminar la primera, la última o la única no crea un corte. Eliminar la única deja el proyecto sin escenas.

Reordenar mueve una escena a otra posición de la lista. Un corte sigue existiendo, con su transición, solo cuando esas dos escenas quedan juntas y en el mismo orden. Si el par se separa o se invierte, el corte desaparece. Cada par vecino nuevo nace en corte directo.

El fundido queda solo en un corte cuyo par sigue junto. Estas operaciones no lo crean. **Proyecto** admite la lista vacía. **Corte** es el límite entre una escena y la que la sigue, y ahí vive la transición. **Transición** es el paso de un corte. **Escena** no cambió: tiene medio visual desde que nace.

La duración de una imagen nueva y el recorte de un video nuevo no son esta decisión. Quedan en [Con qué duración y recorte nace la escena](12-duracion-al-anadir.md).
