import express, { Express } from 'express';
import dotenv from 'dotenv';
import module from '../config/module'
import bodyParser from "body-parser";
import {logger} from '../config/logger';
import fileRoutes from '../routes/fileRoutes'
import proxy from 'express-http-proxy';



dotenv.config();

const app: Express = express();

app.use('/newApi/*',proxy("http://localhost:3001/"))

app.use(bodyParser.json())
const port = process.env.PORT || 8080;


app.get('/', (req, res) => {
  res.send("FileSystem");
})

//Routes for files manipulation
app.use('/file',fileRoutes)

app.listen(port, () => {
  logger.info("-------------------------------------------Server started---------------------------------------------");
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app;