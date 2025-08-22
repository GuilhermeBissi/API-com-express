// carrega variáveis do .env
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());

// Teste: printar a URI
console.log(" MONGO_URI carregada:", process.env.MONGO_URI);

// conexão com o MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(" Conectado ao MongoDB Atlas"))
  .catch(err => console.error(" Erro ao conectar ao MongoDB:", err.message));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Servidor rodando na porta ${PORT}`);
  console.log(` Ambiente: ${process.env.NODE_ENV}`);
});
