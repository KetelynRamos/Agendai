const chatWindow = document.getElementById('chatWindow');
const chatSendBtn = document.getElementById('chatSendBtn');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatTitle = document.getElementById('chatTitle');
const chatToggleBtn = document.getElementById('chatToggleBtn');
let activeCustomer = "";

// Lógica para fechar o chat
if (closeChatBtn) {
    closeChatBtn.addEventListener('click', () => {
        chatWindow.classList.remove('active');
        const chatWidget = document.getElementById('chatWidget');
        if (chatWidget) chatWidget.style.display = 'none';
    });
}

if (chatToggleBtn) {
    chatToggleBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
    });
}

// Função para trocar o cliente do chat
function switchChatContext(customerName) {
    activeCustomer = customerName;
    chatWindow.classList.add('active');
    if (chatTitle) chatTitle.innerText = `Chat com ${customerName}`;
    loadMessages();
}

function loadMessages() {
    chatMessages.innerHTML = "";
    const history = JSON.parse(localStorage.getItem(`chat_${activeCustomer}`)) || [];
    history.forEach(msg => {
        renderMessage(msg.sender, msg.text);
    });
}

function renderMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.style.marginBottom = '10px';
    msgDiv.style.padding = '8px';
    msgDiv.style.background = sender === 'Você' ? '#e0f2f7' : '#e2e2e2'; 
    msgDiv.style.borderRadius = '8px';
    msgDiv.style.alignSelf = sender === 'Você' ? 'flex-end' : 'flex-start';
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Simulação de envio de mensagem
chatSendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const text = chatInput.value.trim();
    if (text && activeCustomer) {
        const history = JSON.parse(localStorage.getItem(`chat_${activeCustomer}`)) || [];
        const newMsg = { sender: 'Você', text: text };
        history.push(newMsg);
        localStorage.setItem(`chat_${activeCustomer}`, JSON.stringify(history));
        
        renderMessage('Você', text);
        chatInput.value = '';
    }
}