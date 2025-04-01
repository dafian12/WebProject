const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/send-otp', (req, res) => {
    const nomorHp = req.body.nomor_hp;
    const otp = Math.floor(1000 + Math.random() * 9000);

    console.log(`OTP ${otp} telah dikirim ke nomor ${nomorHp}`);

    res.send(`OTP ${otp} telah dikirim ke nomor ${nomorHp}`);
});

module.exports = app;
