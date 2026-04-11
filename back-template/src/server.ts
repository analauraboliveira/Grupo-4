import express from "express";
import { prisma } from "../lib/prisma";

const app = express();

app.use(express.json());

app.get("/", async (req, res) => {
    const users = await prisma.usuarios.findMany();
    res.send(users)
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
