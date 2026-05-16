const express = require('express');
const { authUser } = require('../middlewares/auth.middlewares.js');
const router = express.Router();
const chatController = require('../controllers/chat.controller.js');
// Controllers

router.post('/message',authUser,chatController.createChat)

module.exports = router;