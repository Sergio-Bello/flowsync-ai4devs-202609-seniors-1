# Prompts

Aquí van **todos los prompts que lanzaste** para hacer el ejercicio, en el orden en que los
lanzaste, con el modelo y la herramienta de cada uno.

Esto no es papeleo. Lo que se revisa es **cómo pediste las cosas**, no solo lo que salió: un
resultado flojo con un prompt bueno y un resultado flojo con un prompt vago necesitan feedback
distinto, y sin este archivo no se distinguen.

## Cómo rellenarlo

- Un apartado `## Prompt N` por cada prompt.
- **Pega el prompt tal cual lo lanzaste**, dentro del bloque de código, aunque ocupe diez líneas
  y aunque tenga faltas. No lo reescribas para que quede bien: el que arreglaste mentalmente
  después no es el que lanzaste.
- Incluye también los que **no funcionaron**. Suelen ser los más útiles de leer.
- `Modelo` y `Herramienta` en todos. Si cambiaste de una a otra a mitad, se nota aquí.

Borra el ejemplo de abajo cuando escribas el primero.

---

## Prompt 1

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Escribe la spec de lo que hace el código de este proyecto, pero solo en relación a la vertical de cuentas y acceso (es decir, registro, inicio de sesión, sesión y perfil). Nada que no sea de cuentas y acceso. La spec tanto de backend como de frontend. Aplica este formato: 

Arriba, un ## Purpose de una o dos frases: para qué existe esta capability.

Debajo, ## Requirements, y colgando de él ### Requirement: en los que el sistema SHALL hacer algo.

Bajo cada requisito, al menos un #### Scenario: de cuatro almohadillas, con dos viñetas: **WHEN** y **THEN**. No hay casilla para el GIVEN: la precondición se mete dentro del WHEN.

En castellano, salvo las mayúsculas de la RFC 2119

Bajo ninguna circunstancia incluyas nada de ADDED, MODIFIED ni REMOVED. Limitate a describir lo observable (lo que una persona puede ver y hacer) y no incluyas aspectos técnicos o detalles de implementación (como nombres de clases o archivos, o rutas de codigo)
```

**Qué salió:** Funcionó a la primera, enumeró los requisitos definidos tambien mencionó cuatro puntos del funcionamiento que no sabía si eran intencionados o fallos
