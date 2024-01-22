const express = require('express');
const app = express();
const PORT = 3000;

// Ruta de ejemplo
app.get('/', (req, res) => {
    res.json({ message: '¡Bienvenido a mi API!' });
});

// Escuchar en el puerto 3000
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
