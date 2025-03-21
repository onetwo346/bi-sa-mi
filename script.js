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
let targetLanguage = 'EN'; // Default translation language (can be changed dynamically)

// Transition to Chatbot with Welcome Message
startBtn.addEventListener('click', () => {
    introPage.style.display = 'none';
    chatbotPage.style.display = 'flex';
    addChatBubble('ai-bubble', 'Hi there! I’m Bi Sa Mi, your 24/7 study buddy. I can help with translations, answer simple questions, or assist with your homework. What would you like to do today?');
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

    // Handle creator-related questions
    if (lowerMessage.includes('who designed') || lowerMessage.includes('who created') || lowerMessage.includes('who made')) {
        addChatBubble('ai-bubble', 'I’m Bi Sa Mi, and I was designed by Cosmos Coderr. How can I assist you today?');
        return;
    }

    // Handle language change request (e.g., "translate to French")
    if (lowerMessage.includes('translate to')) {
        const langMatch = lowerMessage.match(/translate to (\w+)/i);
        if (langMatch) {
            const newLang = langMatch[1].toUpperCase();
            const supportedLanguages = ['EN', 'FR', 'ES', 'DE', 'IT', 'NL', 'PL', 'PT', 'RU', 'JA', 'ZH'];
            if (supportedLanguages.includes(newLang)) {
                targetLanguage = newLang;
                addChatBubble('ai-bubble', `Got it! I’ll translate to ${newLang} from now on. What would you like to translate?`);
                return;
            } else {
                addChatBubble('ai-bubble', `Sorry, I don’t support translations to ${newLang}. I can translate to EN, FR, ES, DE, IT, NL, PL, PT, RU, JA, or ZH. Which language would you like to use?`);
                return;
            }
        }
    }

    // Handle basic math (e.g., "what is 2 + 2")
    if (lowerMessage.includes('what is') && lowerMessage.includes('+')) {
        try {
            const numbers = lowerMessage.match(/\d+/g); // Extract numbers
            if (numbers && numbers.length === 2) {
                const sum = parseInt(numbers[0]) + parseInt(numbers[1]);
                addChatBubble('ai-bubble', `Let’s see… ${numbers[0]} + ${numbers[1]} equals ${sum}. Do you have another math problem for me, or would you like to try something else?`);
                return;
            }
        } catch (error) {
            addChatBubble('ai-bubble', 'Hmm, I couldn’t solve that math problem. Try something like "What is 2 + 2?"—what else can I help you with?');
            return;
        }
    }

    // Handle basic greetings (e.g., "Hello", "Hi")
    if (lowerMessage === 'hello' || lowerMessage === 'hi' || lowerMessage === 'hey') {
        addChatBubble('ai-bubble', `Hello! I can help with translations or answer some basic questions for your homework. What would you like to do?`);
        return;
    }

    // Handle goodbye (e.g., "Bye", "Goodbye")
    if (lowerMessage === 'bye' || lowerMessage === 'goodbye') {
        addChatBubble('ai-bubble', `Goodbye! If you need help with your homework or translations later, I’ll be here for you. Take care!`);
        return;
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
                'target_lang': targetLanguage
            })
        });

        if (!response.ok) {
            throw new Error(`DeepL API request failed: ${response.status}`);
        }

        const data = await response.json();
        const translatedText = data.translations[0].text;
        addChatBubble('ai-bubble', `Here’s your translation: "${translatedText}" (to ${targetLanguage}). Would you like to translate something else, or do you have a question for me?`);
    } catch (error) {
        console.error('Error fetching translation:', error);
        addChatBubble('ai-bubble', 'Oh no, something went wrong with the translation! Let’s try again—what would you like to translate?');
    }
}

// Handle Image Upload (Placeholder for OCR)
async function handleImageUpload(file) {
    const fileType = file.type;
    if (fileType.startsWith('image/')) {
        addChatBubble('ai-bubble', 'Thanks for uploading an image! I can’t translate it directly yet, but if you type out the text, I can help with the translation. Or, would you like assistance with adding OCR to extract the text? What’s next?');
    } else {
        addChatBubble('ai-bubble', 'You’ve uploaded a file! I can only work with text or images right now. If you have text to translate or an image with text, feel free to share. What would you like to do?');
    }
}

// Initialize
userInput.focus();
