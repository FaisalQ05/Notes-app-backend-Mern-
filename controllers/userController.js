const User = require('./../models/User')
const Note = require('./../models/Note')
const bcrypt = require('bcrypt')


const getAllUser = async (req, res) => {
    const users = await User.find().select('-password').lean()
    if (!users.length) {
        return res.status(400).json({ message: "Users not found" })
    }
    res.json(users)
}


const createUser = async (req, res) => {
    const { username, password, roles } = req.body
    // console.log(req.body)
    if (!(username && password)) {
        return res.status(400).json({ message: "All fields required" })
    }
    const duplicate = await User.findOne({ username }).collation({
        locale: 'en', strength: 2
    }).lean().exec()
    if (duplicate) {
        return res.status(400).json({ message: "Duplicate username" })
    }
    const userObject = (!Array.isArray(roles) || !roles.length || roles.includes('')) ? { username, password } :
        { username, password, roles }

    const user = await User.create(userObject)

    if (user) {
        return res.status(200).json({ message: `New User ${username} created` })
    }
    else {
        return res.status(400).json({ message: `Invalid user data received` })
    }
}


const updateUser = async (req, res) => {
    const { id, username, password, roles, active } = req.body
    if (!(id && username && Array.isArray(roles) && roles.length && !roles.includes("") &&
        typeof active == "boolean")) {
        return res.status(400).json({ message: "All details required" })
    }
    const user = await User.findById(id).exec();
    if (!user) {
        return res.status(400).json({ message: "User not found" })
    }

    const duplicate = await User.findOne({ username }).collation({
        locale: 'en', strength: 2
    }).lean().exec()

    // console.log(duplicate?._id)
    // console.log(duplicate?._id.toString())
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(400).json({ message: "Duplicate Username" })
    }

    user.username = username
    user.roles = roles
    user.active = active

    if (password) {
        user.password = password
    }

    const updatedUser = await user.save();

    return res.json({ message: `${updatedUser.username} updated` })
}


const deleteUser = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: "Id reuqired" })
    }
    const note = await Note.findOne({ user: id }).lean().exec()
    if (note) {
        return res.status(400).json({ message: "User has assigned notes" })
    }

    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: "User not found" })
    }

    const result = await user.deleteOne();

    const message = `Username ${result.username} with ID ${result._id} deleted`
    res.json({ message:'User deleted Successfully' })
}

module.exports = { getAllUser, createUser, updateUser, deleteUser }