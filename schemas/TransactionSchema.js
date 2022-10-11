const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let TransactionSchema = new Schema({
    amount: Number,
    beneficiary: Number
});

module.exports = mongoose.model("Transaction", TransactionSchema);