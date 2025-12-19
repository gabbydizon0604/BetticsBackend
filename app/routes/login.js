const express = require('express')
const controller = require('../controllers/login')

const router = express.Router()
// Match frontend route: /api/Login/Login (uppercase 'Login' for Linux compatibility)
const path = '/api/Login'

router.post(
    `${path}/Login`,
    controller.getLogin
)

module.exports = router;