const chatModel = require('../models/chat.model');

exports.createChat = async (req, res) => {
    try {
        const { title } = req.body;
        const user = req.user;
         console.log(user)
        const chat = await chatModel.create({ user: user._id, title });

        res.status(201).json(chat);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}