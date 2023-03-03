const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const loginlimiter = require('../middleware/LoginLimiter')

router.route('/').post(loginlimiter,authController.login)

router.route('/refresh').get(authController.refresh)

router.route('/logout').post(authController.logout)

module.exports = router