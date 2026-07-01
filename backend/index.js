require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT;

// MIDDLEWARE
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send(`Kudos Board Server is running`)
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
