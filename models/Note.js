const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false
    },
}, { timestamps: true })

module.exports = mongoose.model('notes', noteSchema)