import 'dotenv/config';
import app from './app.js';

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`Authentica backend listening on port ${PORT}`);
});

export default server;
