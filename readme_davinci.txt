====================================================================
GUÍA DE ARRANQUE PASO A PASO ("FOR DUMMIES") - VIDEO PLATFORM MVP
====================================================================

¡Hola! Soy DAVINCI. He preparado este sistema para que arranque de 
forma automática. No necesitas ser programador para hacerlo funcionar.
Solo sigue estos 4 pasos exactamente en orden:

PASO 1: PREPARA TU ORDENADOR
--------------------------------------------------------------------
Necesitas tener instalado un programa llamado "Docker Desktop". 
Si no lo tienes, descárgalo gratis desde docker.com, instálalo 
y ábrelo (déjalo corriendo en segundo plano).

PASO 2: CREA TU ARCHIVO DE SECRETOS (.env)
--------------------------------------------------------------------
1. Entra en la carpeta de este proyecto.
2. Verás un archivo que se llama ".env.example".
3. Duplícalo o hazle una copia y renombra esa copia a simplemente ".env" 
   (sí, empieza por un punto).
4. Abre ese archivo ".env" con cualquier bloc de notas.
5. Verás que te pide cosas como "STRIPE_SECRET_KEY". Pon ahí las 
   claves reales que te dé Stripe. Si solo vas a mirar la web sin probar 
   los pagos, puedes dejarlo tal cual está. Guarda el archivo.

PASO 3: ENCIENDE LA MÁQUINA
--------------------------------------------------------------------
1. Abre tu "Terminal" (en Mac) o "Símbolo del sistema" (en Windows).
2. Ve a la carpeta donde tienes este proyecto.
3. Escribe este comando mágico y pulsa Enter:

   docker compose up -d --build

4. Espera un par de minutos. Verás que descarga cosas y monta las 
   piezas. Cuando termine, el sistema estará encendido de forma invisible.

PASO 4: ABRE LA PLATAFORMA
--------------------------------------------------------------------
1. Abre tu navegador web favorito (Chrome, Safari...).
2. Escribe en la barra de direcciones: http://localhost:3000

¡Y ya está! Estarás viendo la web Premium de vídeos diseñada por PINTATIX.

¿COMO LO APAGO?
--------------------------------------------------------------------
Si quieres apagar la máquina para que no consuma recursos de tu PC, 
vuelve a la terminal y escribe:

   docker compose down
