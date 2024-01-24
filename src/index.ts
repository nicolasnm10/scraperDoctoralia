import express from 'express';
import { Scraper } from './scraper';
const app = express();
const PORT = 3000;

require('dotenv').config();

const indexRouter = express.Router();

// Ruta de ejemplo
indexRouter.get('/', (_req, res) => {
    res.json({ message: '¡Bienvenido a mi API!' });
});

indexRouter.get('/scraper', async (_req, res) => {
    res.json(await Scraper());
});

app.use('/api', indexRouter);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
