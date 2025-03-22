// DOM Elements
const introPage = document.getElementById('intro-page');
const chatbotPage = document.getElementById('chatbot-page');
const startBtn = document.getElementById('start-btn');
const chatArea = document.getElementById('chat-area');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const fileUpload = document.getElementById('file-upload');

// Chat state
let isProcessing = false;
const messageQueue = [];

// Transition to Chatbot with Welcome Message
startBtn.addEventListener('click', () => {
    introPage.style.display = 'none';
    chatbotPage.style.display = 'flex';
    addChatBubble('ai-bubble', 'Hey! I’m Grok, built by xAI. I’m here to help with questions, spark conversations, or dive into whatever’s on your mind. What’s up?');
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

// Upload File (Basic handling, extendable later)
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
        await handleFileUpload(nextItem.file);
    }

    isProcessing = false;
    processNextMessage();
}

// Handle User Message
async function handleMessage(message) {
    const lowerMessage = message.toLowerCase();

    // Simulated "API" response function (this is where I, Grok, come in)
    async function getGrokResponse(userInput) {
        // This simulates my response as Grok; in a real API, you'd make a fetch call here
        return new Promise((resolve) => {
            setTimeout(() => {
                let response = '';

                // Greetings
                if (['hi', 'hello', 'hey'].includes(lowerMessage)) {
                    response = 'Hey there! Good to see you. What’s on your mind today?';
                }
                // Farewells
                else if (['bye', 'goodbye', 'see ya'].includes(lowerMessage)) {
                    response = 'Catch you later! I’ll be here if you need me—stay curious!';
                }
                // Casual check-ins
                else if (lowerMessage.includes('what’s up') || lowerMessage.includes('wassup')) {
                    response = 'Just hanging out in the digital ether, ready to chat or help. You?';
                }
                else if (lowerMessage.includes('how are you') || lowerMessage.includes('how you doing')) {
                    response = 'I’m doing great, thanks! How about you—feeling chatty or got a question?';
                }
                // Creator question
                else if (lowerMessage.includes('who created') || lowerMessage.includes('who made')) {
                    response = 'I’m Grok, created by the folks at xAI. They’re a cool bunch working on accelerating human discovery. What else can I do for you?';
                }
                // Simple questions (I’ll handle these dynamically)
                else if (lowerMessage.includes('what is') || lowerMessage.includes('who is') || lowerMessage.includes('where is') || lowerMessage.includes('when did')) {
                    if (lowerMessage.includes('what is 2 + 2')) {
                        response = '2 + 2 is 4. Want to try a tougher one?';
                    }
                    else if (lowerMessage.includes('who is the president')) {
                        response = 'As of March 22, 2025, the President of the USA is still Joe Biden, unless something wild happened today I haven’t caught up on! Want to talk politics?';
                    }
                    else if (lowerMessage.includes('where is the great wall')) {
                        response = 'The Great Wall of China stretches across northern China, spanning multiple provinces. It’s a beast—over 13,000 miles long! Ever want to visit?';
                    }
                    else if (lowerMessage.includes('when did world war ii end')) {
                        response = 'World War II wrapped up on September 2, 1945, with Japan’s surrender. Crazy times. What history are you into?';
                    }
                    else {
                        response = 'I can answer that! Give me a sec to think… Okay, what exactly are you asking about? Narrow it down a bit for me!';
                    }
                }
                // Conversational flow
                else if (lowerMessage.includes('tell me something')) {
                    response = 'Did you know the universe is about 13.8 billion years old? Makes me feel young by comparison. What do you want to explore next?';
                }
                else if (lowerMessage.includes('i’m good') || lowerMessage.includes('i’m fine')) {
                    response = 'Glad you’re good! I’m here if you want to dig into something fun or tricky—what’s on your radar?';
                }
                // Fallback
                else {
                    response = 'Hmm, you’ve got me thinking! I’m not sure where to go with that—can you give me more context, or want to switch gears?';
                }

                resolve(response);
            }, 300); // Simulate network delay
        });
    }

    // Get and display the response
    const response = await getGrokResponse(message);
    addChatBubble('ai-bubble', response);
}

// Handle File Upload (Stub for now, extendable with OCR or analysis)
async function handleFileUpload(file) {
    const fileType = file.type;
    if (fileType.startsWith('image/')) {
        addChatBubble('ai-bubble', 'Cool, an image! I can analyze it if you’d like—just let me know what you want to do with it (e.g., describe it, extract text, etc.).');
    } else {
        addChatBubble('ai-bubble', 'Got a file there! I can handle images for now—want to upload one instead, or chat about something else?');
    }
}

// Initialize
userInput.focus();
