import express from 'express';
import { Scraper } from './scraperBase/scraper';
const app = express();
const PORT = 3000;

require('dotenv').config();

const indexRouter = express.Router();
app.use(express.json());

// Ruta de ejemplo
indexRouter.get('/', (_req, res) => {
    res.json({ message: '¡Bienvenido a mi API!' });
});

indexRouter.post('/scraper', (req, res) => {
    const { webhook = null } = req.body;
    console.log(webhook);
    Scraper(webhook);
    res.json({ ok: true });
});

app.use('/api', indexRouter);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
