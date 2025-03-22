Let’s dive into fixing and improving your chatbot code! The issues you’re seeing—like the “Hey, I’m Grok” message and the chatbot’s inability to assist with homework effectively—stem from a few key areas: the conversational pattern, the message handling logic, and the lack of robust homework assistance features. I’ll rewrite the code to create a more natural, engaging conversational flow and enhance its ability to help with homework. I’ll also explain the changes as we go.
Issues Identified:
	1	“Hey, I’m Grok” Message: This appears because the initial message in the screenshot is hardcoded to say “I’m Grok, built by xAI,” which doesn’t match the chatbot’s branding as “Bi Sa Mi.” This is a simple fix—we’ll update the intro message to align with the branding.
	2	Poor Conversational Pattern: The chatbot’s responses are repetitive (“Hey there! Good to see you. What’s on your mind today?”) and lack depth. It also struggles with context, as seen when it repeatedly asks for more context without providing helpful prompts or suggestions.
	3	Limited Homework Assistance: The knowledge base is too small, and the chatbot doesn’t handle a wide range of homework questions well. It also lacks the ability to break down problems step-by-step or provide interactive guidance.
	4	No Robust Error Handling: When the chatbot doesn’t understand a question, its fallback responses are generic and unhelpful. We need to make these more engaging and guide the user toward a solution.
Goals for the Rewrite:
	•	Fix the branding issue by ensuring the chatbot introduces itself as “Bi Sa Mi.”
	•	Improve the conversational pattern with varied, context-aware responses and a more natural tone.
	•	Enhance homework assistance by expanding the knowledge base, adding step-by-step problem-solving, and supporting more question types (e.g., math, history, science).
	•	Add better error handling and fallback responses to keep the conversation flowing.
	•	Include features like follow-up questions to clarify user intent and provide more tailored help.
Here’s the rewritten code with these improvements:

// DOM Elements
const introPage = document.getElementById('intro-page');
const chatbotPage = document.getElementById('chatbot-page');
const startBtn = document.getElementById('start-btn');
const chatArea = document.getElementById('chat-area');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const fileUpload = document.getElementById('file-upload');

// DeepL API Key (unchanged)
const DEEPL_API_KEY = '34b401f4-bf30-4a68-b58d-e232fcd7cd39:fx';

// Chat State
let isProcessing = false;
const messageQueue = [];
let targetLanguage = 'EN'; // Default language
let conversationContext = []; // Store last few messages for context
let currentTopic = null; // Track the current topic (e.g., math, history)

// Expanded Knowledge Base for Homework Assistance
const knowledgeBase = {
    math: {
        "basic addition": {
            answer: (query) => {
                const numbers = query.match(/\d+/g);
                if (numbers && numbers.length === 2) {
                    const sum = parseInt(numbers[0]) + parseInt(numbers[1]);
                    return `Let’s break it down: ${numbers[0]} + ${numbers[1]} = ${sum}. Need help with another math problem?`;
                }
                return "I see you're asking about addition, but I need two numbers to work with. Try something like 'What is 5 + 3'?";
            }
        },
        "basic subtraction": {
            answer: (query) => {
                const numbers = query.match(/\d+/g);
                if (numbers && numbers.length === 2) {
                    const diff = parseInt(numbers[0]) - parseInt(numbers[1]);
                    return `Here’s the step-by-step: ${numbers[0]} - ${numbers[1]} = ${diff}. Want to try another subtraction problem?`;
                }
                return "Looks like a subtraction question! Give me two numbers, like 'What is 10 - 4'?";
            }
        }
    },
    history: {
        "president of the usa": {
            answer: () => "As of my last update in March 2025, Joe Biden is the President of the USA—he’s been in office since January 20, 2021. Want to know about a specific event during his presidency?",
            followUp: "I can tell you about past presidents too! Who else are you curious about?"
        },
        "world war ii start": {
            answer: () => "World War II started on September 1, 1939, when Germany invaded Poland. That sparked a global conflict—wild times! Want to know more about the key events?",
            followUp: "I can also tell you about the end of the war or major battles. What’s next?"
        }
    },
    science: {
        "photosynthesis": {
            answer: () => "Photosynthesis is how plants make their food using sunlight. The equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. In simple terms, plants take in carbon dioxide and water, use sunlight to make glucose, and release oxygen. Cool, right? Want to dive deeper into the process?",
            followUp: "I can explain related topics like respiration or the carbon cycle. What’s on your mind?"
        }
    },
    geography: {
        "capital of france": {
            answer: () => "The capital of France is Paris—a city known for the Eiffel Tower and amazing food! Want to learn about another country’s capital?",
            followUp: "I can also tell you about famous landmarks in France. What’s next?"
        }
    }
};

// Start Chatbot
startBtn.addEventListener('click', () => {
    introPage.style.display = 'none';
    chatbotPage.style.display = 'flex';
    addChatBubble('ai-bubble', 'Hey there! I’m Bi Sa Mi, your 24/7 study buddy, built to help with homework, spark conversations, or dive into whatever’s on your mind. What’s up?');
    userInput.focus();
});

// Send Message
function sendMessage() {
    const message = userInput.value.trim();
    if (!message || isProcessing) return;
    addChatBubble('user-bubble', message);
    userInput.value = '';
    messageQueue.push(message);
    conversationContext.push({ sender: 'user', text: message });
    if (conversationContext.length > 5) conversationContext.shift(); // Keep last 5 messages
    processNextMessage();
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// File Upload
fileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || isProcessing) return;
    addChatBubble('user-bubble', `Uploaded: ${file.name}`);
    messageQueue.push({ type: 'file', file });
    processNextMessage();
});

// Add Chat Bubble with Typing Effect
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

// Core Message Handler
async function handleMessage(message) {
    const lowerMessage = message.toLowerCase();

    // Utility: Random Response Picker
    const getRandomResponse = (responses) => responses[Math.floor(Math.random() * responses.length)];

    // DeepL Translation Function
    async function translateText(text) {
        if (targetLanguage === 'EN') return text;
        try {
            const response = await fetch('https://api-free.deepl.com/v2/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    'auth_key': DEEPL_API_KEY,
                    'text': text,
                    'target_lang': targetLanguage
                })
            });
            if (!response.ok) throw new Error('DeepL API failed');
            const data = await response.json();
            return data.translations[0].text;
        } catch (error) {
            console.error('Translation error:', error);
            return text; // Fallback to original
        }
    }

    // Check Context for Follow-ups
    const lastMessage = conversationContext[conversationContext.length - 2]?.text.toLowerCase() || '';

    // Language Switch
    if (lowerMessage.includes('translate to')) {
        const langMatch = lowerMessage.match(/translate to (\w+)/i);
        if (langMatch) {
            const newLang = langMatch[1].toUpperCase();
            const supportedLanguages = ['EN', 'FR', 'ES', 'DE', 'IT', 'NL', 'PL', 'PT', 'RU', 'JA', 'ZH'];
            if (supportedLanguages.includes(newLang)) {
                targetLanguage = newLang;
                const response = await translateText(`Got it! I’ll now respond in ${newLang}. What’s next—need help with homework or just want to chat?`);
                addChatBubble('ai-bubble', response);
                return;
            } else {
                const response = await translateText(`Sorry, I don’t support ${newLang} yet. I can handle EN, FR, ES, DE, IT, NL, PL, PT, RU, JA, or ZH. Which one would you like to use?`);
                addChatBubble('ai-bubble', response);
                return;
            }
        }
    }

    // Greetings with Varied Responses
    if (['hello', 'hi', 'hey'].includes(lowerMessage)) {
        const greetings = [
            'Hey there! I’m Bi Sa Mi, ready to help with your homework or just chat. What’s on your mind?',
            'Hi! I’m your study buddy, Bi Sa Mi. Got any homework questions, or should we talk about something else?',
            'Hello! Bi Sa Mi here to assist. Are you working on homework, or do you want to explore a fun topic?'
        ];
        const response = await translateText(getRandomResponse(greetings));
        addChatBubble('ai-bubble', response);
        return;
    }

    // Farewells with a Friendly Tone
    if (['bye', 'goodbye', 'see ya'].includes(lowerMessage)) {
        const farewells = [
            'Bye for now! I’ll be here if you need help with more homework—study hard!',
            'See you later! Hit me up anytime for homework help or a quick chat.',
            'Catch you soon! Don’t hesitate to come back if you’re stuck on a problem.'
        ];
        const response = await translateText(getRandomResponse(farewells));
        addChatBubble('ai-bubble', response);
        return;
    }

    // Casual Check-ins with Context Awareness
    if (lowerMessage.includes('what’s up') || lowerMessage.includes('wassup')) {
        const casual = [
            'Just hanging out, ready to help! Are you working on homework, or do you want to chat about something else?',
            'Not much, just here to assist with your studies. What’s up with you—got a tough homework question?',
            'I’m all ears (or rather, all text)! What’s going on—need help with a school assignment?'
        ];
        const response = await translateText(getRandomResponse(casual));
        addChatBubble('ai-bubble', response);
        return;
    }

    // How Are You Responses
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how you doing')) {
        const states = [
            'I’m doing great, thanks for asking! How about you—need help with any homework?',
            'I’m feeling awesome, ready to tackle your questions! What’s on your mind today?',
            'I’m good, thanks! How are you—working on something tricky for school?'
        ];
        const response = await translateText(getRandomResponse(states));
        addChatBubble('ai-bubble', response);
        return;
    }

    // Homework Assistance: Math
    if (lowerMessage.includes('what is') && lowerMessage.includes('+')) {
        currentTopic = 'math';
        const response = await translateText(knowledgeBase.math["basic addition"].answer(lowerMessage));
        addChatBubble('ai-bubble', response);
        return;
    }
    if (lowerMessage.includes('what is') && lowerMessage.includes('-')) {
        currentTopic = 'math';
        const response = await translateText(knowledgeBase.math["basic subtraction"].answer(lowerMessage));
        addChatBubble('ai-bubble', response);
        return;
    }

    // Homework Assistance: Knowledge Base Questions
    if (['who is', 'what is', 'where is', 'when did', 'how many', 'why did'].some(q => lowerMessage.includes(q))) {
        let entity = lowerMessage.split(/who is|what is|where is|when did|how many|why did/)[1]?.trim().replace('?', '') || lowerMessage;
        entity = entity.replace(/\bthe\b/gi, '').trim();

        // Normalize entity
        if (entity.includes('usa') || entity.includes('america')) entity = 'president of the usa';
        if (entity.includes('world war 2')) entity = entity.replace('world war 2', 'world war ii');

        let response = '';
        let followUp = '';
        let found = false;

        for (const category in knowledgeBase) {
            if (knowledgeBase[category][entity]) {
                currentTopic = category;
                response = knowledgeBase[category][entity].answer();
                followUp = knowledgeBase[category][entity].followUp || 'What else would you like to learn about?';
                found = true;
                break;
            }
        }

        if (!found) {
            response = 'I’m not sure about that one—can you give me more details or ask about something else? For example, I can help with math, history, science, or geography!';
        } else {
            response += '\n' + followUp;
        }

        response = await translateText(response);
        addChatBubble('ai-bubble', response);
        return;
    }

    // Fallback with Helpful Suggestions
    const fallbacks = [
        'Hmm, I’m not sure I understand. Are you asking about homework? Try something like "What is 2 + 2?" or "Who’s the president of the USA?"',
        'I might need a bit more info to help you out. Are you working on math, history, science, or something else? Give me a hint!',
        'Looks like I’m stumped! Let’s try this—tell me what subject you’re working on, or ask a question like "What is photosynthesis?"'
    ];
    const response = await translateText(getRandomResponse(fallbacks));
    addChatBubble('ai-bubble', response);
}

// Translation Handler
async function getTranslation(text) {
    const translated = await translateText(text);
    const response = await translateText(`Here’s your translation: "${translated}" (to ${targetLanguage}). Need help with anything else?`);
    addChatBubble('ai-bubble', response);
}

// Image Upload (Assuming Tesseract.js is included)
async function handleImageUpload(file) {
    if (file.type.startsWith('image/')) {
        addChatBubble('ai-bubble', 'Let me take a look at that image…');
        try {
            const { data: { text } } = await Tesseract.recognize(file, 'eng');
            if (!text.trim()) {
                const response = await translateText('I couldn’t find any text in that image. Try uploading another one, or type your question instead!');
                addChatBubble('ai-bubble', response);
                return;
            }
            const response = await translateText(`I found this text: "${text}". Want me to translate it to ${targetLanguage}, or should I help with something else?`);
            addChatBubble('ai-bubble', response);
            conversationContext.push({ sender: 'ai', text: response });
            messageQueue.push(text); // Add extracted text to queue for further processing
        } catch (error) {
            const response = await translateText('Oops, I couldn’t read that image. Can you try another one, or type out your question?');
            addChatBubble('ai-bubble', response);
        }
    } else {
        const response = await translateText('I can only process images or text files. Try uploading an image, or type your question instead!');
        addChatBubble('ai-bubble', response);
    }
}

// Initialize
userInput.focus();
