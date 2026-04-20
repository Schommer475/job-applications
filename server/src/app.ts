import express from "express";
import morgan from "morgan";
import authorize from "./middleware/authorize.js";
import handleErrors from "./middleware/handleErrors.js";
import authRoutes from "./routes/auth.js";
import positionRoutes from "./routes/positions.js";

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
app.use("/users/:profileId/positions", authorize, positionRoutes);
app.use(handleErrors);
