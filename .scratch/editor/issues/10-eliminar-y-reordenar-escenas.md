# 10 — Eliminar y reordenar escenas

**What to build:** La persona elimina una escena o la mueve a otra posición del proyecto. La escena eliminada se lleva sus textos y su narración; el medio sigue en la biblioteca. Un corte, con su fundido, sobrevive solo si esas dos escenas siguen juntas y en el mismo orden. El par que queda vecino por primera vez nace en corte directo. El proyecto puede quedar sin escenas.

**Blocked by:** 09 — El fundido entre dos escenas

**Status:** done

- [x] Eliminar saca la escena con sus textos y su narración
- [x] El medio sigue en la biblioteca
- [x] Desaparecen los cortes que tocaban a esa escena, incluido el tiempo de fundido que tuvieran
- [x] Si dos escenas quedan vecinas y antes no lo eran, ese corte nace en corte directo
- [x] Eliminar la primera, la última o la única no crea un corte
- [x] Eliminar la única deja el proyecto sin escenas y la duración del short en cero
- [x] Reordenar mueve una escena a otra posición de la lista
- [x] Un corte sigue existiendo, con su transición, solo cuando esas dos escenas quedan juntas y en el mismo orden
- [x] Si el par se separa o se invierte, el corte desaparece con su tiempo
- [x] Cada par vecino nuevo nace en corte directo
- [x] Eliminar y reordenar no crean un fundido
