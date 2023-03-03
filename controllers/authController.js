const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const login = async (req, res) => {
    const { username, password } = req.body
    if (!(username && password)) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    const foundUser = await User.findOne({ username }).collation({
        locale: 'en', strength: 2
    }).exec()
    // console.log(foundUser)
    if (!foundUser || !foundUser.active) {
        return res.status(400).json({ message: 'User Not found' })
    }
    const match = await bcrypt.compare(password, foundUser.password)
    if (!match) return res.status(400).json({ message: 'Wrong password' })

    const accessToken = jwt.sign(
        {
            "userInfo": {
                "username": foundUser.username,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1m' }
    )
    const refreshToken = jwt.sign(
        {
            "username": foundUser.username
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    )

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000
        // maxAge: 15 * 1000
    })

    res.json({ accessToken })
}


const refresh = async (req, res) => {
    const cookies = req.cookies

    // console.log("cookies : ", cookies)
    if (!cookies?.jwt) {
        return res.status(401).json({ message: 'Unauthorized .. did not found cookies' })
    }
    const refreshToken = cookies.jwt
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Forbidden . Refresh token verification failed' })

        // console.log("Decoded : ", decoded)
        const foundUser = await User.findOne({ username: decoded.username }).exec()

        if (!foundUser) return res.status(401).json({ message: 'Unauthorized . Wrong User Details' })

        const accessToken = jwt.sign(
            {
                "userInfo": {
                    "username": foundUser.username,
                    "roles": foundUser.roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1m' }
        )
        return res.json({ accessToken })
    })
}


const logout = async (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) //No content
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    return res.json({ message: 'Cookie cleared' })
}


module.exports = { login, refresh, logout }