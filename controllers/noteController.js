const Note = require('./../models/Note')
const User = require('./../models/User')


const getAllNotes = async (req, res) => {
    const notesWithUser = await Note.find().populate('user', '-password').lean().exec()
    if (!notesWithUser.length) {
        return res.status(400).json({ message: "No notes found" })
    }
    res.json(notesWithUser)
}

const createNote = async (req, res) => {
    const { user, title, text } = req.body
    if (!(user && title && text)) {
        return res.status(400).json({ message: "All fields required" })
    }
    const duplicate = await Note.findOne({ title }).collation({
        locale: 'en', strength: 2
    }).lean().exec()
    if (duplicate) {
        return res.status(400).json({ message: "Duplicate note title" })
    }
    const isUser = await User.findById(user).lean().exec()
    // console.log(isUser)
    if (!isUser) {
        return res.status(400).json({ message: 'No user Found' })
    }
    const note = await Note.create({ user, title, text })
    if (note) {
        return res.json({ message: 'New note created' })
    }
    else {
        return res.status(400).json({ message: 'Invalid note data received' })
    }
}

const updateNote = async (req, res) => {
    const { id, user, title, text, completed } = req.body
    if (!(id && user && title && text && typeof completed == 'boolean')) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'No note Found' })
    }

    // const isUser = await User.findById(user).lean().exec()
    // if (!isUser) {
    //     return res.status(400).json({ message: 'No user Found' })
    // }

    const duplicate = await Note.findOne({ title }).collation({
        locale: 'en', strength: 2
    }).lean().exec()

    if (duplicate && duplicate._id.toString() !== id) {
        return res.status(400).json({ message: 'Duplicate note title' })
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()

    res.json({ message: 'Note updated' })
}

const deleteNote = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Note ID required' })
    }

    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    const result = await note.deleteOne()

    res.json({ message: 'Note deleted Successfully' })
}

module.exports = { getAllNotes, createNote, updateNote, deleteNote }