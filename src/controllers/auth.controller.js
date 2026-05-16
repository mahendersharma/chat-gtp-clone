const userModel = require('../models/user.model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { fullname: { firstName, lastName }, email, password } = req.body;

        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            fullname: { firstName, lastName },
            email,
            password: hashedPassword
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token);
        res.status(201).json({ message: 'User registered successfully', user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email)
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid password' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token);
        res.status(200).json({ message: 'Login successful', user, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

