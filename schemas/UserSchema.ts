import mongoose from "mongoose"
const cardSchema = require('./CardSchema');

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    fname: String,
    lname: String,
    address: String,
    pnumber: String,
    cards: [
        cardSchema
    ]
});

module.exports = UserSchema;