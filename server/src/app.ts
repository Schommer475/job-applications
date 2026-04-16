import express from "express";
import handleErrors from "./middleware/handleErrors";
import loginRoutes from "./routes/login";

const app = express();

export default app;

app.use(express.json());
app.use("/login", loginRoutes);
app.use(handleErrors);
