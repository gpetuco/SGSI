require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectMongoDB = require("./config/db");

const autenticacaoR = require("./routes/autenticacaoR");
const usuarioR = require("./routes/usuarioR");
const acaoR = require("./routes/acaoR");
const clienteR = require("./routes/clienteR");

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

app.use("/api/auth", autenticacaoR);
app.use("/api/users", usuarioR);
app.use("/api/acoes", acaoR);
app.use("/api/companies", clienteR);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORTA = process.env.PORTA || 5000;
app.listen(PORTA, () => console.log(`Servidor: Porta ${PORTA}`));
