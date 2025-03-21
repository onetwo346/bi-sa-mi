// DOM Elements
const introPage = document.getElementById('intro-page');
const chatbotPage = document.getElementById('chatbot-page');
const startBtn = document.getElementById('start-btn');
const chatArea = document.getElementById('chat-area');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const fileUpload = document.getElementById('file-upload');

// DeepL API Key (Your provided key)
const DEEPL_API_KEY = '34b401f4-bf30-4a68-b58d-e232fcd7cd39:fx';

// Chat state
let isProcessing = false;
const messageQueue = [];

// Transition to Chatbot with Welcome Message
startBtn.addEventListener('click', () => {
    introPage.style.display = 'none';
    chatbotPage.style.display = 'flex';
    addChatBubble('ai-bubble', 'Hey there! I’m Bi Sa Mi, your translation buddy, designed by Cosmos Coderr. I can help translate text for you, and I can also answer some basic questions. What do you want to do?');
    userInput.focus();
});

// Send Message
function sendMessage() {
    const message = userInput.value.trim();
    if (!message || isProcessing) return;
    addChatBubble('user-bubble', message);
    userInput.value = '';
    messageQueue.push(message);
    processNextMessage();
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Upload File
fileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || isProcessing) return;
    addChatBubble('user-bubble', `Uploaded: ${file.name}`);
    messageQueue.push({ type: 'file', file });
    processNextMessage();
});

// Add Chat Bubble with Typing Animation
function addChatBubble(type, content) {
    const bubble = document.createElement('div');
    bubble.classList.add('chat-bubble', type);
    chatArea.appendChild(bubble);
    
    if (type === 'ai-bubble') {
        bubble.textContent = '...';
        setTimeout(() => {
            bubble.textContent = content;
            chatArea.scrollTop = chatArea.scrollHeight;
        }, 500);
    } else {
        bubble.textContent = content;
        chatArea.scrollTop = chatArea.scrollHeight;
    }
}

// Process Message Queue
async function processNextMessage() {
    if (isProcessing || !messageQueue.length) return;
    isProcessing = true;
    const nextItem = messageQueue.shift();

    if (typeof nextItem === 'string') {
        await handleMessage(nextItem);
    } else if (nextItem.type === 'file') {
        await handleImageUpload(nextItem.file);
    }

    isProcessing = false;
    processNextMessage();
}

// Handle User Message
async function handleMessage(message) {
    const lowerMessage = message.toLowerCase();

    // Handle system-related questions
    if (lowerMessage.includes('who designed') || lowerMessage.includes('who created') || lowerMessage.includes('your system')) {
        addChatBubble('ai-bubble', 'I’m Bi Sa Mi, and I was designed by Cosmos Coderr. What else would you like to know?');
        return;
    }

    // Handle basic math (e.g., "what is 2+2")
    if (lowerMessage.includes('what is') && lowerMessage.includes('+')) {
        try {
            const numbers = lowerMessage.match(/\d+/g); // Extract numbers
            if (numbers && numbers.length === 2) {
                const sum = parseInt(numbers[0]) + parseInt(numbers[1]);
                addChatBubble('ai-bubble', `The answer is ${sum}. What else would you like to do?`);
                return;
            }
        } catch (error) {
            addChatBubble('ai-bubble', 'I couldn’t parse that math question. Try something like "What is 2+2?"—what else can I help with?');
            return;
        }
    }

    // Default to translation for other messages
    await getTranslation(message);
}

// Get Translation from DeepL API
async function getTranslation(text) {
    try {
        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'auth_key': DEEPL_API_KEY,
                'text': text,
                'target_lang': 'EN' // Default to English; adjust as needed
            })
        });

        if (!response.ok) {
            throw new Error(`DeepL API request failed: ${response.status}`);
        }

        const data = await response.json();
        const translatedText = data.translations[0].text;
        addChatBubble('ai-bubble', `Translation: ${translatedText}. What else do you want to translate?`);
    } catch (error) {
        console.error('Error fetching translation:', error);
        addChatBubble('ai-bubble', 'Oops, something went wrong with the translation! Try again—what do you want to translate?');
    }
}

// Handle Image Upload (Placeholder for OCR)
async function handleImageUpload(file) {
    const fileType = file.type;
    if (fileType.startsWith('image/')) {
        addChatBubble('ai-bubble', 'I see an image! I can’t translate it directly yet. Please type out the text you want translated. Want help integrating OCR for this? What’s next?');
    } else {
        addChatBubble('ai-bubble', 'File uploaded! I can only handle text or images right now. Please type your text to translate or upload an image. What’s on your mind?');
    }
}

// Initialize
userInput.focus();
