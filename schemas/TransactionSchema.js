const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CardHolderSchema = require("./CardHolderSchema");

let TransactionSchema = new Schema({
    sender: CardHolderSchema,
    receiver: CardHolderSchema,
    amount: Number
});

module.exports = TransactionSchema;