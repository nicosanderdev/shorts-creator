# 10 — Eliminar y reordenar escenas

**What to build:** La persona elimina una escena o la mueve a otra posición del proyecto. La escena eliminada se lleva sus textos y su narración; el medio sigue en la biblioteca. Un corte, con su fundido, sobrevive solo si esas dos escenas siguen juntas y en el mismo orden. El par que queda vecino por primera vez nace en corte directo. El proyecto puede quedar sin escenas.

**Blocked by:** 09 — El fundido entre dos escenas

**Status:** ready-for-agent

- [ ] Eliminar saca la escena con sus textos y su narración
- [ ] El medio sigue en la biblioteca
- [ ] Desaparecen los cortes que tocaban a esa escena, incluido el tiempo de fundido que tuvieran
- [ ] Si dos escenas quedan vecinas y antes no lo eran, ese corte nace en corte directo
- [ ] Eliminar la primera, la última o la única no crea un corte
- [ ] Eliminar la única deja el proyecto sin escenas y la duración del short en cero
- [ ] Reordenar mueve una escena a otra posición de la lista
- [ ] Un corte sigue existiendo, con su transición, solo cuando esas dos escenas quedan juntas y en el mismo orden
- [ ] Si el par se separa o se invierte, el corte desaparece con su tiempo
- [ ] Cada par vecino nuevo nace en corte directo
- [ ] Eliminar y reordenar no crean un fundido
