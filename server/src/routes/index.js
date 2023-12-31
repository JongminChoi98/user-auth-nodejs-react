import express from "express";
import authRouter from "./authRouter";

const router = express.Router();

router.use("/users", authRouter);

export default router;
