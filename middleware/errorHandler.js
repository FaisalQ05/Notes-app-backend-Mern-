const { enIE } = require('date-fns/locale')
const { logEvent } = require('./logger')

const errorHandler = (error, req, res, next) => {
    logEvent(`${error.name}\t${error.message}\t${req.method}\t${req.url}\t`, 'ErrorLogs.log')
    // console.log("Error Handler : ", error)

    const status = res.statusCode ? res.statusCode : 500
    res.status(status)

    if (error.name === 'ValidationError') {
        // console.log("validation error ************")
        if (error.errors.password) {
            error.message = error.errors.password.message
        }
        if (error.errors['roles.0'] || error.errors['roles.1'] || error.errors['roles.2']) {
            error.message = "Please enter correct role for user"
        }
    }
    if (error.name === 'CastError') {
        error.message = `Invalid ${error.path} : ${error.value}`
    }

    res.json({ message: error.message, isError: true })
}

module.exports = errorHandler