const mongoose = require('mongoose');
const cardHolderSchema = require('./CardHolderSchema');

const cardSchema = new mongoose.Schema({
    cardHolder: cardHolderSchema,
    cardNumber: String,
    balance: Number
})

module.exports = cardSchema;