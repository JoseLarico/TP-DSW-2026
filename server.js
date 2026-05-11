import 'dotenv/config';
import app from './app.js';
import { connectDB } from './src/config/db.js';

const PORT = 3000;
const HOST = 'localhost';

connectDB()
  .then(() => {
    app.listen(PORT, HOST, () => {
      console.log(`Servidor escuchando en http://${HOST}:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error al conectar a MongoDB:", error);
    process.exit(1);
  });
