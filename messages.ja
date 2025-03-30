let messages = [];

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const message = JSON.parse(req.body);
        messages.push(message);

        // Batasi pesan yang disimpan agar tidak terlalu banyak (misalnya 100 pesan terbaru)
        if (messages.length > 100) {
            messages.shift();
        }

        res.status(200).json({ status: 'Pesan diterima' });
    } else if (req.method === 'GET') {
        res.status(200).json(messages);
    }
}
