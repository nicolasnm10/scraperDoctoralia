import express from 'express';
const app = express();
const PORT = 3001;

require('dotenv').config()

const indexRouter = express.Router();

// Ruta de ejemplo
indexRouter.get('/', (_req, res) => {
    res.json({ message: '¡Bienvenido a mi API!' });
});

app.use('/api', indexRouter);

// Escuchar en el puerto 3000
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});


