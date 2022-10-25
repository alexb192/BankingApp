import mongoose from "mongoose";
const cardHolderSchema = require('./CardHolderSchema');
const TransactionSchema = require('./TransactionSchema');

const cardSchema = new mongoose.Schema({
    cardHolder: cardHolderSchema,
    cardNumber: String,
    balance: Number,
    transactions: [
        TransactionSchema
    ]
}, {_id: false});

module.exports = cardSchema;