import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

import {router} from './src/routes/router.js';

const app = express();
app.use(express.json());
app.use(router);

if (process.env.NODE_ENV !== 'production') {
  const port = 3000;
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

export default app;
