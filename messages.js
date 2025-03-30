async function sendMessage() {
    const messageContent = chatInput.value.trim();
    if (!messageContent) return;

    const message = {
        username,
        content: messageContent,
        time: new Date().toLocaleTimeString()
    };

    // Tampilkan pesan langsung di layar tanpa menunggu polling
    appendMessageToChat(message);

    chatInput.value = ''; // Kosongkan input

    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });

        if (!response.ok) {
            alert('Gagal mengirim pesan, coba lagi.');
        }
    } catch (error) {
        alert('Gagal terhubung ke server.');
    }
}

function appendMessageToChat(message) {
    const chatMessage = document.createElement('div');
    chatMessage.classList.add('chat-message');
    chatMessage.innerHTML = `<strong>${message.username}:</strong> ${message.content} <small style="font-size: 10px;">(${message.time})</small>`;
    chatBody.appendChild(chatMessage);
    chatBody.scrollTop = chatBody.scrollHeight;
}

async function fetchMessages() {
    try {
        const response = await fetch('/api/messages');
        const messages = await response.json();

        chatBody.innerHTML = ''; // Bersihkan chat lama
        messages.forEach(appendMessageToChat); // Tampilkan semua pesan

    } catch (error) {
        console.log('Gagal mengambil pesan dari server.');
    }
}

sendBtn.addEventListener('click', sendMessage);

// Refresh chat setiap 2 detik
setInterval(fetchMessages, 2000);

fetchMessages();
