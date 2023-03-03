const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: (v) => {
                const regex = /^(?=.*[A-Za-z0-9])(?!.*\s).{5,}$/
                return regex.test(v)
            },
            message: "Invalid password."
        }
    },
    roles: {
        type: [String],
        default: ["Employee"],
        enum: ["Employee", "Admin", "Manager"]
    },
    active: {
        type: Boolean,
        default: true
    }
})


userSchema.pre('save', async function (next) {
    if (this.isModified("password")) {
        // console.log("Password before Hash : ", this.password)
        const salt = await bcrypt.genSalt(8)
        this.password = await bcrypt.hash(this.password, salt)
        // console.log("Password before Hash : ", this.password)
    }
    next()
})

module.exports = mongoose.model('users', userSchema)