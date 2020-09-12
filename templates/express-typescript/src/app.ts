import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import AppRouter from "./routes/appRouter";
import { errorHandler, notFound } from "./middleware";
import config from "./config";

export const app = express();

app.use(morgan(config.logLevel));
app.use(helmet());
app.use(compression());

app.use('/', AppRouter);

app.use(notFound);
app.use(errorHandler);

export default app;