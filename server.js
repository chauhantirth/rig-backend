import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
// app.use((req, res, next) => setTimeout(next, 500))

export default app;
