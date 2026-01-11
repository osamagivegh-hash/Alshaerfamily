const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true,
        unique: true,
        index: true
    },
    count: {
        type: Number,
        default: 0
    },
    ips: {
        type: [String],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);
