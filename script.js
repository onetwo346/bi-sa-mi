// DOM Elements
const introPage = document.getElementById('intro-page');
const chatbotPage = document.getElementById('chatbot-page');
const startBtn = document.getElementById('start-btn');
const chatArea = document.getElementById('chat-area');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const fileUpload = document.getElementById('file-upload');

// Transition to Chatbot
startBtn.addEventListener('click', () => {
    introPage.style.display = 'none';
    chatbotPage.style.display = 'flex';
});

// Send Message
function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        addChatBubble('user-bubble', message);
        userInput.value = '';
        simulateAIResponse(message);
    }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Upload File
fileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        addChatBubble('user-bubble', `Uploaded: ${file.name}`);
        simulateImageResponse(file);
    }
});

// Add Chat Bubble
function addChatBubble(type, content) {
    const bubble = document.createElement('div');
    bubble.classList.add('chat-bubble', type);
    bubble.textContent = content;
    chatArea.appendChild(bubble);
    chatArea.scrollTop = chatArea.scrollHeight; // Ensure scroll to bottom works on iOS
}

// Simulate AI Response (Replace with API Call)
function simulateAIResponse(message) {
    setTimeout(() => {
        let response = '';
        if (message.toLowerCase().includes('summarize')) {
            response = 'Here’s a summary: [Your notes condensed]. Want flashcards?';
        } else if (message.toLowerCase().includes('flashcards')) {
            response = 'Flashcard: Front: What’s 2+2? Back: 4. Need more?';
        } else if (message.toLowerCase().includes('quiz')) {
            response = 'Quiz Q1: What’s the capital of France? A) Paris. Try it!';
        } else {
            response = `Let me help: ${message} solved/explained! What’s next?`;
        }
        addChatBubble('ai-bubble', response);
    }, 500); // Simulate fast response
}

// Simulate Image Response (Replace with OCR + API)
function simulateImageResponse(file) {
    setTimeout(() => {
        addChatBubble('ai-bubble', 'Analyzed image: Solved 2x + 3 = 7 → x = 2. More help?');
    }, 500);
}
