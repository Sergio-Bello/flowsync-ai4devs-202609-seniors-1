### PARTE A

Scenarios en el requisito: 3 · Cubiertos: 3

Scenario: Cuando una tarea tiene un responsable, su 'assignee' trae el nombre y sus iniciales que lo identifican
Test que lo cubre: la tarea suelta trae el nombre y las iniciales de su responsable / la lista trae el nombre y las iniciales del responsable de cada tarea
Creo que esta cubierto

Scenario: Cuando se obtiene cualquier tarea, su 'assignee' no incluye el email ni ningun dato de acceso
Test que lo cubre: la tarea suelta no expone el email ni otros datos de la cuenta / la lista no expone el email ni otros datos de la cuenta
Creo que esta cubierto

Scenario: Cuando el responsable se registro sin nombre, su nombre e iniciales llegan nulos y no se recurre al email
Test que lo cubre: un responsable sin nombre llega con nombre nulo e iniciales en la tarea suelta / un responsable sin nombre llega con nombre nulo e iniciales en la lista
Creo que esta cubierto


### PARTE B

1. Cuántos scenarios creías cubiertos antes de mirar, y cuántos lo estaban
Tras pedir los tests al asistente, creia cubiertos los tres escenarios, y los tres lo estaban. Antes de hacerlo sabia que ninguno estaba cubierto porque vi que en la carpeta /tests/functional/tasks no habia contenido

2. El scenario en el que no supiste si faltaba un test o faltaba la regla en la spec
No se prueba que cuando se indican nombres para dos tareas diferentes, para cada una el sistema devuelve el nombre que corresponde. Faltaria la regla en la spec

3. Algo que el scenario no determinaba y tuviste que decidir al escribir el test
No identifico ninguno. Los tests los escribi con el asistente 