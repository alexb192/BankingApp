const mongoose = require('mongoose');

let CardHolderSchema = new mongoose.Schema({
    fname: String,
    lname: String
})

module.exports = CardHolderSchema;