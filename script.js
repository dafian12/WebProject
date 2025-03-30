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
            <span class="username">${chats[i].username}: </span>
            <span class="message-text">${chats[i].message}</span>
        `;
        chatBody.appendChild(chatMessage);
    }
}

// fungsi untuk mengirim chat
function sendChat() {
    let username = 'Anda'; // ganti dengan username yang diinginkan
    let message = chatInput.value;
    if (message.trim() === '') return;
    
    chats.push({ username, message });
    chatInput.value = '';
    displayChat();
    saveChat();
}

// fungsi untuk menyimpan chat ke local storage
function saveChat() {
    localStorage.setItem('chats', JSON.stringify(chats));
}

// fungsi untuk memuat chat dari local storage
function loadChat() {
    let storedChats = localStorage.getItem('chats');
    if (storedChats) {
        chats = JSON.parse(storedChats);
        displayChat();
    }
}

sendBtn.addEventListener('click', sendChat);

// Memuat chat dari local storage saat halaman dimuat
loadChat();
