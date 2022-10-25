import mongoose from "mongoose"
const Schema = mongoose.Schema;
const CardHolderSchema = require("./CardHolderSchema");

let TransactionSchema = new Schema({
    date: Date,
    sender: CardHolderSchema,
    receiver: CardHolderSchema,
    amount: Number
});

module.exports = TransactionSchema;