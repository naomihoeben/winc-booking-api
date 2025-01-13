import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import validateLogin from "../middleware/validateLogin.js";

const prisma = new PrismaClient();
const loginRouter = express.Router();

loginRouter.post("/", validateLogin, async (req, res, next) => {
	try {
		const { username, password } = req.body;

		const user = await prisma.user.findUnique({
			where: { username },
		});

		if (!user || user.password !== password) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const token = jwt.sign({ id: user.id, username: user.username }, process.env.AUTH_SECRET_KEY, {
			expiresIn: "1h",
		});

		res.status(200).json({ token });
	} catch (error) {
		console.error("Error in POST /login:", error.message);
		next(error);
	}
});

export default loginRouter;
