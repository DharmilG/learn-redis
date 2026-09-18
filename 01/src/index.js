import express from 'express';
import Redis from 'ioredis';
import mongoose from 'mongoose';

const app = express();
const redis_clinet = new Redis(process.env.URL_REDIS || 'redis://localhost:6379');


app.get('/redis', async (req, res) => {
    const reply = await redis_clinet.ping();
    res.send({redis : reply});
}
)

app.get('/mongo', async (req, res) => {
    const url = process.env.URL_MONGO || 'mongodb://localhost:27017/redis-learn';
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(url);
    }
    res.send({mongo : 'Connected to MongoDB', database: mongoose.connection.name});
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});