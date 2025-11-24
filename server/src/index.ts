import express, { json, urlencoded } from "express";
import dotenv from "dotenv";

dotenv.config();

export function createApp(): express.Express {
  const app = express();

  app.use(urlencoded({ extended: true }));

  app.use(json());

  app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.path}`);
    next();
  });

  return app;
}

function serve(app: express.Express) {
  const port = process.env.PORT || 3004;

  app.listen(port, () =>
    console.log(`Contexte listening at http://localhost:${port}`)
  );
}

serve(createApp());
