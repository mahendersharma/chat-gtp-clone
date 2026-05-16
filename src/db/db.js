const mogoose = require('mongoose');

    async function connectDB() {
    try {
        await mogoose.connect(process.env.MONGO_URI)
        console.log('MongoDB connected');
    }
        catch (error) {
            console.error('MongoDB connection error:', error);
        }
    }

    module.exports = connectDB;
