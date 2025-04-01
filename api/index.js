const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/send-otp', (req, res) => {
    const nomorHp = req.body.nomor_hp;

    if (!nomorHp) {
        return res.status(400).send("Nomor HP tidak ditemukan.");
    }

    const otp = Math.floor(1000 + Math.random() * 9000); // OTP 4 digit
    const pesan = `Kode OTP Anda adalah: ${otp}`;

    const whatsappLink = `https://wa.me/${nomorHp}?text=${encodeURIComponent(pesan)}`;

    res.send({ link: whatsappLink });
});

module.exports = app;
