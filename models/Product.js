const mongoose = require("mongoose");

const productModel = new mongoose.Schema({
    name: String, 
    price: Number,
    image: String,
    date: {type: Date, default: Date.now}
})

const Product = mongoose.model("Product", productModel);

module.exports = Product;