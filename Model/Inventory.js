const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
        Itemcode: {
            type: String,
            required: true
        },
        Model: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        Brand: {
            type: String,
            required: true
        },
        Inward: {
            type: String,
            required: true
        },
        Outward: {
            type: String,
            required: true
        },
        Current: {
            type: String,
            required: true
        }
    }, { timestamps: true });

module.exports = mongoose.model('Inventory1', InventorySchema);
