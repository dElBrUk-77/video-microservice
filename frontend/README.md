Front-end minimal para pruebas del servicio de autenticación y listado de videos.

Cómo usarlo:

1. Asegúrate de que el backend esté corriendo en http://localhost:4000
2. Servir esta carpeta estática. Por ejemplo desde la raíz `frontend/`:

```bash
# con Python 3
python3 -m http.server 3000

# o usando serve (npm)
npx serve . -l 3000
```

3. Abrir http://localhost:3000 en el navegador.
