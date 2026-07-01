require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const boardRoute = require("./routes/boardRoute");
const cardRoute = require("./routes/cardRoute");
const commentRoute = require("./routes/commentRoute");
const userRoute = require("./routes/userRoute");
const { login } = require("./controllers/userController");

const app = express();
const PORT = process.env.PORT;

// MIDDLEWARE
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send(`Kudos Board Server is running`)
})

// ROUTES
app.use("/boards", boardRoute);
app.use("/cards", cardRoute);
app.use("/comments", commentRoute);
app.use("/users", userRoute);
app.post("/login", login);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
