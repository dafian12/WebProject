let chatBody = document.getElementById('chat-body');
let chatInput = document.getElementById('chat-input');
let sendBtn = document.getElementById('send-btn');

// array untuk menyimpan chat
let chats = [];

// fungsi untuk menampilkan chat
function displayChat() {
    chatBody.innerHTML = '';
    for (let i = 0; i < chats.length; i++) {
        let chatMessage = document.createElement('div');
        chatMessage.classList.add('chat-message');
        chatMessage.innerHTML = `
            <span class="username">${chats[i].username}</span>
            <span class="message-text">${chats[i].message}</span>
        `;
        chatBody.appendChild(chatMessage);
    }
}

// fungsi untuk mengirim chat
function sendChat() {
    let username = 'Anda'; // ganti dengan username yang diinginkan
    let message = chatInput.value;
    chats.push({ username, message });
    chatInput.value = '';
    displayChat();
}

sendBtn.addEventListener('click', sendChat);

// menampilkan chat saat pertama kali halaman dibuka
displayChat();
