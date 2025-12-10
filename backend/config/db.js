const mongoose = require("mongoose");

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_ACCESS, {});
    console.log("-- Conectado ao MongoDB ---");
  } catch (err) {
    console.error("!!! Erro ao conectar com MongoDB !!!", err);
    process.exit(1);
  }
};

module.exports = connectMongoDB;
