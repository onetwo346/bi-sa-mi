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

// Transition to Chatbot with Welcome Message
startBtn.addEventListener('click', () => {
    introPage.style.display = 'none';
    chatbotPage.style.display = 'flex';
    addChatBubble('ai-bubble', 'Hi! I’m Bi Sa Mi, your 24/7 Study Buddy. You can ask me *anything*—math, science, history, or even upload a problem for me to solve. What’s on your mind?');
});

// Send Message
function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        addChatBubble('user-bubble', message);
        userInput.value = '';
        getAIResponse(message);
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
        handleImageUpload(file);
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
                model: 'gpt-3.5-turbo', // You can use 'gpt-4' if you have access
                messages: [
                    {
                        role: 'system',
                        content: 'You are Bi Sa Mi, an AI-powered study assistant. Your role is to help students with educational questions, including math, science, history, literature, and more. Provide clear, concise, and accurate answers, and always encourage further learning by asking a follow-up question like "What’s next?" or suggesting related topics. If the user requests summaries, flashcards, or quizzes, generate them as requested.'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 500, // Adjust based on desired response length
                temperature: 0.7 // Adjust for creativity (0 = more deterministic, 1 = more creative)
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const aiReply = data.choices[0].message.content.trim();
        addChatBubble('ai-bubble', aiReply);
    } catch (error) {
        console.error('Error fetching AI response:', error);
        addChatBubble('ai-bubble', 'Oops, something went wrong while fetching the response. Please try again! What’s next?');
    }
}

// Handle Image Upload (Placeholder for OCR)
async function handleImageUpload(file) {
    // For now, we’ll add a placeholder response since OpenAI’s API (without vision) can’t process images directly
    addChatBubble('ai-bubble', 'Image upload detected! To process this, we need to extract text from the image. Please integrate an OCR library like Tesseract.js, or if you have access to GPT-4 with vision, I can help you modify the code to process images directly. For now, can you type the problem from the image?');

    // Uncomment the following if you add Tesseract.js for OCR
    /*
    try {
        const { data: { text } } = await Tesseract.recognize(file, 'eng');
        addChatBubble('user-bubble', `Extracted text from image: ${text}`);
        getAIResponse(text);
    } catch (error) {
        addChatBubble('ai-bubble', 'Oops, I couldn’t process the image. Can you type the problem instead?');
    }
    */
}
