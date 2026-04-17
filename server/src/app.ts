import express from "express";
import morgan from "morgan";
import handleErrors from "./middleware/handleErrors.js";
import loginRoutes from "./routes/login.js";

const app = express(),
	{ENVIRONMENT} = process.env;

let logger;

export default app;

if (ENVIRONMENT === "Development") {
	logger = morgan("dev");
} else {
	logger = morgan("combined");
}

app.use(logger);
app.use(express.json());
app.use("/login", loginRoutes);
app.use(handleErrors);
