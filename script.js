// DOM Elements
const introPage = document.getElementById('intro-page');
const chatbotPage = document.getElementById('chatbot-page');
const startBtn = document.getElementById('start-btn');
const chatArea = document.getElementById('chat-area');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const fileUpload = document.getElementById('file-upload');

// DeepL API Key
const DEEPL_API_KEY = '34b401f4-bf30-4a68-b58d-e232fcd7cd39:fx';

// Chat State
let isProcessing = false;
const messageQueue = [];
let targetLanguage = 'EN'; // Default language
let conversationContext = []; // Store last few messages for context

// Expanded Knowledge Base
const knowledgeBase = {
    history: {
        "president of the usa": "As of March 2025, the president of the USA is still Joe Biden—unless something wild happened recently!",
        "world war ii start": "World War II kicked off on September 1, 1939, when Germany rolled into Poland.",
        "world war ii end": "It wrapped up on September 2, 1945, with Japan’s surrender—crazy times!",
        "american civil war": "The American Civil War ran from 1861 to 1865—Union vs. Confederacy, a real mess.",
        "declaration of independence": "That was July 4, 1776—America said 'peace out' to Britain."
    },
    geography: {
        "capital of france": "France? Oh, that’s Paris—super romantic spot!",
        "capital of japan": "Japan’s capital is Tokyo—bustling and futuristic!",
        "great wall of china": "The Great Wall stretches across northern China, over 13,000 miles—built to keep invaders out.",
        "largest ocean": "The Pacific Ocean’s the biggest—155.6 million square kilometers of water!",
        "number of continents": "Seven continents: Africa, Antarctica, Asia, Australia, Europe, North America, South America."
    },
    science: {
        "photosynthesis": "Photosynthesis? Plants use sunlight to turn CO2 and water into food—pretty neat trick!",
        "number of planets": "Eight planets in our solar system—Pluto’s still out of the club, poor guy.",
        "gravity": "Gravity’s the force pulling stuff together—like why we don’t float off into space!"
    },
    literature: {
        "author of to kill a mockingbird": "Harper Lee wrote *To Kill a Mockingbird*—a total classic from 1960.",
        "author of romeo and juliet": "That’s Shakespeare’s *Romeo and Juliet*—tragic love story from around 1597."
    },
    general: {
        "tallest mountain": "Mount Everest, 8,848 meters—roof of the world!",
        "longest river": "The Nile, 6,650 kilometers—flows through Africa like a champ."
    }
};

// Start Chatbot
startBtn.addEventListener('click', () => {
    introPage.style.display = 'none';
    chatbotPage.style.display = 'flex';
    addChatBubble('ai-bubble', 'Hey, I’m Bi Sa Mi—your homework wingman! I can tackle questions, translate stuff, or just vibe with you. What’s on your mind?');
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
                const response = await translateText(`Alright, switching to ${newLang}! What’s next—homework or a chat?`);
                addChatBubble('ai-bubble', response);
                return;
            } else {
                const response = await translateText(`Whoops, ${newLang} isn’t on my list. Try EN, FR, ES, DE, IT, NL, PL, PT, RU, JA, or ZH—what’s your pick?`);
                addChatBubble('ai-bubble', response);
                return;
            }
        }
    }

    // Greetings
    if (['hello', 'hi', 'hey'].includes(lowerMessage)) {
        const greetings = [
            'Hey hey! What’s cooking—homework or just a chill chat?',
            'Hi there! I’m pumped to help you out—what’s up?',
            'Yo, what’s good? Ready to tackle some questions or just hang?'
        ];
        const response = await translateText(getRandomResponse(greetings));
        addChatBubble('ai-bubble', response);
        return;
    }

    // Farewells
    if (['bye', 'goodbye', 'see ya'].includes(lowerMessage)) {
        const farewells = [
            'Later, fam! I’ll be here when you’re back—stay sharp!',
            'Catch you on the flip side! Need me, I’m a click away.',
            'See ya! Don’t study too hard without me, alright?'
        ];
        const response = await translateText(getRandomResponse(farewells));
        addChatBubble('ai-bubble', response);
        return;
    }

    // Casual Check-ins
    if (lowerMessage.includes('what’s up') || lowerMessage.includes('wassup')) {
        const casual = [
            'Just chilling with my digital brain—how about you? Homework vibes?',
            'Not much, just here to save your grades! What’s on your radar?',
            'Yo, just vibing—ready to chat or crush some homework?'
        ];
        const response = await translateText(getRandomResponse(casal));
        addChatBubble('ai-bubble', response);
        return;
    }

    // How Are You
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how you doing')) {
        const states = [
            'I’m dope, thanks! How you holding up—need a study boost?',
            'Living my best AI life! You good—want to dive into something?',
            'I’m stellar—how about you? What’s the homework sitch?'
        ];
        const response = await translateText(getRandomResponse(states));
        addChatBubble('ai-bubble', response);
        return;
    }

    // Simple Math
    if (lowerMessage.includes('what is') && lowerMessage.includes('+')) {
        try {
            const numbers = lowerMessage.match(/\d+/g);
            if (numbers && numbers.length === 2) {
                const sum = parseInt(numbers[0]) + parseInt(numbers[1]);
                const response = await translateText(`Easy peasy: ${numbers[0]} + ${numbers[1]} = ${sum}. More math or something else?`);
                addChatBubble('ai-bubble', response);
                return;
            }
        } catch (error) {
            const response = await translateText('Math’s not clicking there—try "what is 5 + 3" or ask me something else!');
            addChatBubble('ai-bubble', response);
            return;
        }
    }

    // Knowledge Base Questions
    if (['who is', 'what is', 'where is', 'when did', 'how many', 'why did'].some(q => lowerMessage.includes(q))) {
        let entity = lowerMessage.split(/who is|what is|where is|when did|how many|why did/)[1]?.trim().replace('?', '') || lowerMessage;
        entity = entity.replace(/\bthe\b/gi, '').trim();

        // Normalize entity
        if (entity.includes('usa') || entity.includes('america')) entity = 'president of the usa';
        if (entity.includes('world war 2')) entity = entity.replace('world war 2', 'world war ii');
        if (entity.includes('civil war')) entity = 'american civil war';

        let response = '';
        let found = false;
        for (const category in knowledgeBase) {
            if (knowledgeBase[category][entity]) {
                response = knowledgeBase[category][entity] + ' Want to dig deeper into this?';
                found = true;
                break;
            }
        }

        if (!found) {
            response = 'Hmm, my brain’s drawing a blank—try another question or let’s chat about something else!';
        }

        response = await translateText(response);
        addChatBubble('ai-bubble', response);
        return;
    }

    // Fallback with Personality
    const fallbacks = [
        'You’ve stumped me! Wanna throw me a homework curveball or just vibe?',
        'I’m lost in space here—give me a nudge with a question or let’s chat!',
        'Oops, my circuits blinked! What’s next—homework or a random rant?'
    ];
    const response = await translateText(getRandomResponse(fallbacks));
    addChatBubble('ai-bubble', response);
}

// Translation Handler
async function getTranslation(text) {
    const translated = await translateText(text);
    const response = await translateText(`Here’s your translation: "${translated}" (to ${targetLanguage}). What else you got?`);
    addChatBubble('ai-bubble', response);
}

// Image Upload (Assuming Tesseract.js is included)
async function handleImageUpload(file) {
    if (file.type.startsWith('image/')) {
        addChatBubble('ai-bubble', 'Scanning that image for you…');
        try {
            const { data: { text } } = await Tesseract.recognize(file, 'eng');
            if (!text.trim()) {
                const response = await translateText('No text found—try another image or type it out!');
                addChatBubble('ai-bubble', response);
                return;
            }
            const response = await translateText(`Extracted: "${text}". Translating to ${targetLanguage}…`);
            addChatBubble('ai-bubble', response);
            await getTranslation(text);
        } catch (error) {
            const response = await translateText('Image scan failed—try again or type it instead?');
            addChatBubble('ai-bubble', response);
        }
    } else {
        const response = await translateText('I can only read images or text—whatcha got next?');
        addChatBubble('ai-bubble', response);
    }
}

// Initialize
userInput.focus();
