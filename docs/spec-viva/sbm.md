# Parte A: la spec. Cuentas y acceso

## Purpose

Permite que una persona cree una cuenta en FlowSync, entre y salga con ella, mantenga la sesión abierta entre visitas y consulte los datos de su perfil. Es la puerta de entrada al resto del producto: sin sesión válida no se accede a nada privado.

## Requirements

### Requirement: Registro de cuenta por API

El sistema SHALL permitir crear una cuenta nueva a partir de un email, una contraseña, su confirmación y, opcionalmente, un nombre completo, y SHALL dejar a la persona con la sesión iniciada en la misma respuesta.

#### Scenario: Registro correcto

- **WHEN** se envía una petición de registro con un email válido que no está registrado, una contraseña de entre 8 y 32 caracteres, la misma contraseña como confirmación y un nombre completo
- **THEN** la respuesta es de éxito y contiene, dentro de `data`, los datos públicos de la cuenta recién creada y un token de acceso utilizable de inmediato

#### Scenario: Registro sin nombre

- **WHEN** se envía una petición de registro válida con el nombre a `null` o como cadena vacía
- **THEN** la cuenta se crea igualmente y su nombre completo aparece como `null`

#### Scenario: Registro sin el campo de nombre

- **WHEN** se envía una petición de registro válida en la que el campo del nombre no aparece
- **THEN** la petición se rechaza con un error de validación sobre el nombre, porque el campo debe viajar siempre aunque su valor sea `null`

#### Scenario: Email ya registrado

- **WHEN** se envía una petición de registro con un email idéntico al de una cuenta existente
- **THEN** la petición se rechaza con un error de validación sobre el email y no se crea ninguna cuenta

#### Scenario: Datos de registro inválidos

- **WHEN** se envía una petición de registro con un email mal formado o de más de 254 caracteres, una contraseña de menos de 8 o más de 32 caracteres, o una confirmación que no coincide con la contraseña
- **THEN** la petición se rechaza con un error de validación que lista, por cada campo afectado, el campo y la regla incumplida, y no se crea ninguna cuenta

### Requirement: Inicio de sesión por API

El sistema SHALL permitir iniciar sesión con email y contraseña y SHALL entregar un token de acceso nuevo en cada inicio de sesión correcto.

#### Scenario: Credenciales correctas

- **WHEN** se envía una petición de inicio de sesión con el email y la contraseña de una cuenta existente
- **THEN** la respuesta es de éxito y contiene, dentro de `data`, los datos públicos de la cuenta y un token de acceso nuevo

#### Scenario: Credenciales incorrectas

- **WHEN** se envía una petición de inicio de sesión con un email que no existe o con una contraseña que no corresponde a ese email
- **THEN** la petición se rechaza con un error de credenciales inválidas, sin indicar cuál de los dos datos falla

#### Scenario: Datos de inicio de sesión mal formados

- **WHEN** se envía una petición de inicio de sesión sin email, con un email mal formado o sin contraseña
- **THEN** la petición se rechaza con un error de validación sobre el campo afectado, sin comprobar las credenciales

#### Scenario: Varias sesiones simultáneas

- **WHEN** una misma cuenta inicia sesión varias veces sin cerrar las sesiones anteriores
- **THEN** cada inicio de sesión recibe un token distinto y todos siguen siendo válidos a la vez

### Requirement: Acceso autenticado a recursos de la cuenta

El sistema SHALL exigir un token de acceso válido, enviado como credencial de tipo Bearer, para consultar el perfil y para cerrar sesión.

#### Scenario: Petición sin token

- **WHEN** se consulta el perfil o se pide cerrar sesión sin enviar token
- **THEN** la petición se rechaza como no autenticada

#### Scenario: Petición con token inválido o revocado

- **WHEN** se consulta el perfil o se pide cerrar sesión con un token que no existe o que ya se cerró
- **THEN** la petición se rechaza como no autenticada

#### Scenario: Los tokens no caducan por tiempo

- **WHEN** se usa un token emitido hace tiempo que nunca se ha cerrado
- **THEN** sigue siendo aceptado

### Requirement: Consulta del perfil por API

El sistema SHALL devolver a la persona autenticada los datos públicos de su propia cuenta.

#### Scenario: Perfil de la persona autenticada

- **WHEN** se consulta el perfil con un token válido
- **THEN** la respuesta contiene, dentro de `data`, el identificador, el nombre completo (o `null`), el email, la fecha de alta, la fecha de última actualización y las iniciales de esa cuenta

#### Scenario: La contraseña nunca se expone

- **WHEN** cualquier respuesta de registro, inicio de sesión o perfil devuelve los datos de una cuenta
- **THEN** esos datos no incluyen la contraseña en ninguna forma

### Requirement: Cálculo de las iniciales

El sistema SHALL calcular unas iniciales en mayúsculas para cada cuenta a partir de su nombre, o de su email si no tiene nombre.

#### Scenario: Nombre con dos o más palabras

- **WHEN** la cuenta tiene un nombre formado por varias palabras separadas por un espacio, como «Ada Lovelace»
- **THEN** las iniciales son la primera letra de la primera palabra y la primera letra de la segunda, en mayúsculas («AL»)

#### Scenario: Nombre de una sola palabra

- **WHEN** la cuenta tiene un nombre de una sola palabra, como «Ada»
- **THEN** las iniciales son las dos primeras letras de esa palabra en mayúsculas («AD»)

#### Scenario: Cuenta sin nombre

- **WHEN** la cuenta no tiene nombre y su email es, por ejemplo, «ada@example.com»
- **THEN** las iniciales son la primera letra de lo que va antes de la arroba y la primera de lo que va después, en mayúsculas («AE»)

### Requirement: Cierre de sesión por API

El sistema SHALL invalidar el token con el que se pide cerrar sesión, y solo ese.

#### Scenario: Cierre de sesión correcto

- **WHEN** se pide cerrar sesión con un token válido
- **THEN** la respuesta es de éxito con un mensaje de confirmación y, a partir de ese momento, ese token se rechaza como no autenticado

#### Scenario: Las demás sesiones siguen abiertas

- **WHEN** una cuenta tiene varios tokens válidos y cierra sesión con uno de ellos
- **THEN** los demás tokens de esa cuenta siguen siendo aceptados

### Requirement: Pantalla de registro

El sistema SHALL ofrecer una pantalla de registro con los campos nombre completo (marcado como opcional), email, contraseña y repetición de la contraseña, y SHALL iniciar la sesión y llevar al perfil cuando el registro sale bien.

#### Scenario: Registro correcto desde la pantalla

- **WHEN** una persona sin sesión rellena el formulario con datos válidos y pulsa «Crear cuenta»
- **THEN** el botón pasa a «Creando cuenta…» y queda deshabilitado mientras se envía, y al terminar la persona queda con la sesión iniciada y ve su perfil

#### Scenario: Las contraseñas no coinciden

- **WHEN** la persona escribe dos contraseñas distintas y pulsa «Crear cuenta»
- **THEN** bajo el campo de repetición aparece «Las contraseñas no coinciden.» y no se envía nada al servidor

#### Scenario: Nombre en blanco

- **WHEN** la persona deja el nombre vacío o solo con espacios y el resto de datos son válidos
- **THEN** la cuenta se crea sin nombre

#### Scenario: Pista de longitud de contraseña

- **WHEN** el campo de contraseña no tiene ningún error
- **THEN** debajo se muestra la pista «Entre 8 y 32 caracteres.», que se sustituye por el mensaje de error cuando lo hay

#### Scenario: Email ya registrado desde la pantalla

- **WHEN** la persona intenta registrarse con un email que ya tiene cuenta
- **THEN** bajo el campo de email aparece «Ese email ya está registrado. Inicia sesión en su lugar.»

#### Scenario: Errores de validación del servidor

- **WHEN** el servidor rechaza el registro por uno o varios campos del formulario
- **THEN** cada mensaje aparece en castellano debajo de su campo, el campo queda marcado como inválido, y no se muestra aviso general

#### Scenario: Enlace a inicio de sesión

- **WHEN** la persona está en la pantalla de registro
- **THEN** ve el texto «¿Ya tienes cuenta?» con un enlace «Inicia sesión» que lleva a la pantalla de inicio de sesión

### Requirement: Pantalla de inicio de sesión

El sistema SHALL ofrecer una pantalla de inicio de sesión con los campos email y contraseña, y SHALL llevar al perfil cuando las credenciales son correctas.

#### Scenario: Inicio de sesión correcto desde la pantalla

- **WHEN** una persona sin sesión introduce el email y la contraseña de su cuenta y pulsa «Entrar»
- **THEN** el botón pasa a «Entrando…» y queda deshabilitado mientras se envía, y al terminar la persona ve su perfil

#### Scenario: Credenciales incorrectas desde la pantalla

- **WHEN** la persona introduce un email o una contraseña que no son correctos
- **THEN** aparece arriba del formulario un aviso de error con «El email o la contraseña no son correctos.»

#### Scenario: Campo vacío o mal formado

- **WHEN** la persona envía el formulario con el email vacío o mal formado, o con la contraseña vacía
- **THEN** el mensaje correspondiente aparece debajo del campo afectado (por ejemplo, «Introduce una dirección de email válida.» o «Falta rellenar la contraseña.»)

#### Scenario: Motivo de una sesión perdida

- **WHEN** la persona llega al inicio de sesión porque su sesión anterior no se pudo restaurar
- **THEN** ve arriba del formulario un aviso con el motivo, que se sustituye por el error del intento actual si lo hay y desaparece al iniciar sesión con éxito

#### Scenario: Enlace a registro

- **WHEN** la persona está en la pantalla de inicio de sesión
- **THEN** ve el texto «¿Aún no tienes cuenta?» con un enlace «Crea una» que lleva a la pantalla de registro

### Requirement: Mensajes de error comprensibles en las pantallas de acceso

El sistema SHALL mostrar todos los errores de las pantallas de acceso como frases en castellano, nunca como códigos o textos técnicos del servidor.

#### Scenario: Servidor inalcanzable

- **WHEN** la persona envía un formulario de acceso y el servidor no responde
- **THEN** ve el aviso «No se pudo conectar con el servidor. Comprueba que el backend está arrancado.»

#### Scenario: Error interno del servidor

- **WHEN** la persona envía un formulario de acceso y el servidor falla por un motivo que no es de validación ni de credenciales
- **THEN** ve el aviso «Algo ha ido mal en el servidor. Inténtalo de nuevo en un momento.»

#### Scenario: Error sobre un campo que no está en pantalla

- **WHEN** el servidor rechaza el envío por un campo que la pantalla no muestra
- **THEN** el mensaje aparece en el aviso general de arriba del formulario, para que no se quede sin enseñar

#### Scenario: Reintento tras un error

- **WHEN** la persona vuelve a enviar un formulario que antes mostró errores
- **THEN** los errores anteriores desaparecen al iniciar el nuevo envío

### Requirement: Sesión persistente en el navegador

El sistema SHALL recordar la sesión en el navegador entre recargas y visitas, y SHALL comprobar contra el servidor que sigue siendo válida antes de darla por buena.

#### Scenario: Recarga con sesión válida

- **WHEN** una persona con sesión iniciada recarga la página o vuelve más tarde en el mismo navegador
- **THEN** ve un indicador de carga mientras se comprueba la sesión y después sigue dentro, sin tener que volver a iniciar sesión

#### Scenario: Sesión rechazada por el servidor

- **WHEN** al cargar la aplicación el servidor ya no reconoce la sesión guardada
- **THEN** la sesión se olvida en el navegador y la persona ve el inicio de sesión con el aviso «Tu sesión ha caducado. Vuelve a iniciar sesión.»

#### Scenario: Servidor caído al restaurar la sesión

- **WHEN** al cargar la aplicación no se puede contactar con el servidor para comprobar la sesión guardada
- **THEN** la persona ve el inicio de sesión con un aviso explicando el problema, pero la sesión guardada se conserva, de modo que al recargar con el servidor disponible vuelve a estar dentro

### Requirement: Protección de pantallas según la sesión

El sistema SHALL mostrar el perfil solo a personas con sesión iniciada y las pantallas de registro e inicio de sesión solo a personas sin ella.

#### Scenario: Acceso al perfil sin sesión

- **WHEN** una persona sin sesión intenta abrir el perfil
- **THEN** es redirigida al inicio de sesión

#### Scenario: Acceso a registro o inicio de sesión con sesión

- **WHEN** una persona con sesión iniciada intenta abrir la pantalla de registro o la de inicio de sesión
- **THEN** es redirigida a su perfil

#### Scenario: Dirección desconocida

- **WHEN** una persona abre cualquier dirección de la aplicación que no es el perfil, el registro ni el inicio de sesión
- **THEN** es enviada al perfil, y de ahí al inicio de sesión si no tiene sesión

#### Scenario: Comprobación de sesión en curso

- **WHEN** la aplicación todavía está comprobando la sesión guardada
- **THEN** ninguna de estas pantallas redirige: se muestra el indicador de carga hasta conocer el resultado

### Requirement: Pantalla de perfil

El sistema SHALL mostrar a la persona con sesión iniciada sus iniciales, su nombre, su email y la fecha en que se dio de alta.

#### Scenario: Perfil con nombre

- **WHEN** una persona con nombre abre su perfil
- **THEN** ve un círculo con sus iniciales, su nombre completo, su email y «Miembro desde» seguido de la fecha de alta en formato largo en castellano (por ejemplo, «29 de septiembre de 2026»)

#### Scenario: Perfil sin nombre

- **WHEN** una persona que se registró sin nombre abre su perfil
- **THEN** en lugar del nombre ve «Sin nombre»

### Requirement: Cierre de sesión desde la pantalla

El sistema SHALL permitir cerrar sesión desde el perfil y SHALL dejar a la persona fuera aunque el servidor no confirme el cierre.

#### Scenario: Cerrar sesión

- **WHEN** una persona pulsa «Cerrar sesión» en su perfil
- **THEN** la sesión se olvida en el navegador, se pide al servidor que invalide el token y la persona ve el inicio de sesión sin ningún aviso de error

#### Scenario: Cerrar sesión con el servidor inaccesible

- **WHEN** una persona pulsa «Cerrar sesión» y el servidor no responde o rechaza la petición
- **THEN** la persona queda igualmente fuera en ese navegador y no ve ningún error


# Parte B: las tres listas

### 1. Cuántos requisitos escribió el agente, y cuántos comprobaste tú abriendo el código

Escribio 15 requisitos (7 BE + 8 FE) y 45 escenarios. No comprobe ninguno abriendo el codigo, priorice revisar la lista y buscar incoherencias o requisitos que me extrañaran


### 2. Las incoherencias que aparecieron al escribirla

WHEN se envía una petición de registro válida en la que el campo del nombre no aparece THEN la petición se rechaza con un error de validación sobre el nombre, porque el campo debe viajar siempre aunque su valor sea null -> Entiendo que puede ser incoherente, si el campo es opcional, es opcional 

WHEN una cuenta tiene varios tokens válidos y cierra sesión con uno de ellos
THEN los demás tokens de esa cuenta siguen siendo aceptados -> No parece un requisito coherente, si llega un cierre de sesión por parte del usuario, no parece que se debieran mantener sesiones de la misma cuenta, ¿cuantas veces tiene entonces que cerrar sesion el usuario si tiene mas tokens? Eso dificulta mucho el cierre de sesión 


### 3. Lo que no supiste decidir si era un bug o el contrato

Scenario: Dirección desconocida
WHEN una persona abre cualquier dirección de la aplicación que no es el perfil, el registro ni el inicio de sesión THEN es enviada al perfil, y de ahí al inicio de sesión si no tiene sesión -> No se si puede haber algun motivo por el que se prefiera este comportamiento al de devolver un error por URL invalida, que pareceria lo logico para evitar que una peticion a una URL no esperada (sospechoso) pueda acceder al sistema

Scenario: Email ya registrado desde la pantalla
WHEN la persona intenta registrarse con un email que ya tiene cuenta
THEN bajo el campo de email aparece «Ese email ya está registrado. Inicia sesión en su lugar -> Para mi puede ser una manera de que otra persona pueda averiguar si la que posee esa direccion de email esta usando la aplicacion, desconozco si se puede considerar que en este dominio no es un problema de privacidad

Scenario: Los tokens no caducan por tiempo
WHEN se usa un token emitido hace tiempo que nunca se ha cerrado THEN sigue siendo aceptado -> Aparentemente un token que no expira por tiempo puede suponer un problema de seguridad, desconozco si puede haber algun motivo por el que los tokens no deban caducar (como tener un panel con la aplicacion abierta de manera permanente)






