import mongoose from "mongoose";

let CardHolderSchema = new mongoose.Schema({
    fname: String,
    lname: String
}, {_id: false})

module.exports = CardHolderSchema;