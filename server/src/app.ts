import express from "express";
import morgan from "morgan";
import handleErrors from "./middleware/handleErrors.js";
import authRoutes from "./routes/auth.js";

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
app.use("/auth", authRoutes);
app.use(handleErrors);
