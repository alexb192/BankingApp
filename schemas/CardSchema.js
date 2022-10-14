const mongoose = require('mongoose');
const cardHolderSchema = require('./CardHolderSchema');
const TransactionSchema = require('./TransactionSchema');

const cardSchema = new mongoose.Schema({
    cardHolder: cardHolderSchema,
    cardNumber: String,
    balance: Number,
    transactions: [
        TransactionSchema
    ]
})

module.exports = cardSchema;