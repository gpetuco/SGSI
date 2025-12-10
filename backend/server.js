require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectMongoDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const acaoRoutes = require("./routes/acaoRoutes");
const companyRoutes = require("./routes/companyRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

connectMongoDB();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/acoes", acaoRoutes);
app.use("/api/companies", companyRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORTA = process.env.PORTA || 5000;
app.listen(PORTA, () => console.log(`Servidor: Porta ${PORTA}`));
