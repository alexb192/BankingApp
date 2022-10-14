const mongoose = require('mongoose');
const cardSchema = require('./CardSchema');

const UserSchema = new mongoose.Schema({
    _id: String,
    fname: String,
    lname: String,
    address: String,
    pnumber: Number,
    cards: [
        cardSchema
    ]
});

module.exports = UserSchema;