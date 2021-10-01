const mongoose = require("mongoose");

const userModel = mongoose.Schema({
    email: String,
    name: String,
    password: String,
    discount: String,
    date: {type: Date, default: Date.now}
},{ autoIndex: true });

module.exports = mongoose.model("User", userModel);