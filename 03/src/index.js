import express from 'express';
import Redis from 'ioredis';


const PORT = process.env.PORT || 1234;

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

function otpKey(phone){
    return `otp:${phone}`;
}

app.post('/send-otp', async (req, res) => {
    const {phone} = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis.set(otpKey(phone), otp, 'EX', 30); // OTP expires in 30 seconds
    res.json({message: 'OTP sent successfully', otp: otp})
});

app.post('/verify-otp', async (req, res) => {
    const {phone, otp} = req.body;
    const saveOTP = await redis.get(otpKey(phone));

    if(!saveOTP){
        return res.status(400).json({message: 'OTP expired'});
    }

    if(saveOTP !== otp){
        return res.status(400).json({message: 'Invalid OTP'});
    }

    await redis.del(otpKey(phone)); // Delete the OTP after successful verification
    res.json({message: 'OTP verified successfully'});
});



app.get('/otp/:phone/ttl', async (req, res) => {
    const ttl = await redis.ttl(otpKey(req.params.phone));
    res.json({ttl: ttl});
});

app.listen(PORT, () => {
    console.log(`Server is running on  http://localhost:${PORT}`);
});