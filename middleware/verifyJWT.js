const jwt = require('jsonwebtoken')

const verifyJwt = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized . Please Add Header Token' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden . wrong token or access token expired' })
        }
        next()
    })
}

module.exports = verifyJwt