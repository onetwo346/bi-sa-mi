// DOM Elements
const introPage = document.getElementById('intro-page');
const chatbotPage = document.getElementById('chatbot-page');
const startBtn = document.getElementById('start-btn');
const chatArea = document.getElementById('chat-area');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const fileUpload = document.getElementById('file-upload');

// OpenAI API Key (Replace with your actual key)
const OPENAI_API_KEY = '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';

// Chat state
let isProcessing = false;
const messageQueue = [];

// Transition to Chatbot with Welcome Message
startBtn.addEventListener('click', () => {
    introPage.style.display = 'none';
    chatbotPage.style.display = 'flex';
    addChatBubble('ai-bubble', 'Hey there! I’m Bi Sa Mi, your 24/7 Study Buddy. Ask me anything—math, science, history, or even upload a problem to solve. What’s on your mind?');
    userInput.focus(); // Improve UX by focusing input immediately
});

// Send Message
function sendMessage() {
    const message = userInput.value.trim();
    if (!message || isProcessing) return; // Prevent empty or concurrent messages
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
    
    // Simulate typing for AI responses
    if (type === 'ai-bubble') {
        bubble.textContent = '...';
        setTimeout(() => {
            bubble.textContent = content;
            chatArea.scrollTop = chatArea.scrollHeight;
        }, 500); // Adjustable delay for realism
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
        await getAIResponse(nextItem);
    } else if (nextItem.type === 'file') {
        await handleImageUpload(nextItem.file);
    }

    isProcessing = false;
    processNextMessage(); // Process next in queue
}

// Get AI Response from OpenAI API
async function getAIResponse(message) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are Bi Sa Mi, a friendly and knowledgeable AI study assistant. Help students with educational queries (math, science, history, etc.) in a clear, concise, and engaging way. Always ask a follow-up question like "What’s next?" or suggest related topics to keep the conversation flowing.'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        const aiReply = data.choices[0].message.content.trim();
        addChatBubble('ai-bubble', aiReply);
    } catch (error) {
        console.error('Error fetching AI response:', error);
        addChatBubble('ai-bubble', 'Oops, something went wrong! Let’s try that again—what’s on your mind?');
    }
}

// Handle Image Upload (Placeholder for OCR)
async function handleImageUpload(file) {
    const fileType = file.type;
    if (fileType.startsWith('image/')) {
        addChatBubble('ai-bubble', 'I see an image! I can’t process it directly yet. For now, please type out the problem or question from the image. Want help integrating OCR to extract text automatically? What’s next?');
    } else {
        addChatBubble('ai-bubble', 'File uploaded! I can only handle text or images right now. Please type your question or upload an image instead. What’s on your mind?');
    }
}

// Initialize
userInput.focus(); // Optional: Focus input on page load for immediate typing
