const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Amount: { type: Number, required: true },
  Date: { type: Date, required: true },
  Verified: { type: String, enum: ["Yes", "No"], required: true }
});

module.exports = mongoose.model("Transaction", transactionSchema);
