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

// Knowledge Base (In-memory data structure for answering questions)
const knowledgeBase = {
    history: {
        "president of the usa": "As of my last update in March 2024, the president of the USA is Joe Biden. He took office on January 20, 2021.",
        "world war ii start": "World War II started on September 1, 1939, when Germany invaded Poland. It lasted until 1945.",
        "world war ii end": "World War II ended on September 2, 1945, when Japan formally surrendered.",
        "american civil war": "The American Civil War took place from 1861 to 1865, between the northern states (Union) and the southern states (Confederacy).",
        "declaration of independence": "The Declaration of Independence was adopted on July 4, 1776, marking the United States' independence from Britain."
    },
    geography: {
        "capital of france": "The capital of France is Paris.",
        "capital of japan": "The capital of Japan is Tokyo.",
        "great wall of china": "The Great Wall of China is located in northern China, stretching over 13,000 miles across various provinces. It was built to protect against invasions.",
        "largest ocean": "The largest ocean on Earth is the Pacific Ocean, covering about 155.6 million square kilometers.",
        "number of continents": "There are 7 continents: Africa, Antarctica, Asia, Australia, Europe, North America, and South America."
    },
    science: {
        "photosynthesis": "Photosynthesis is the process by which green plants, algae, and some bacteria use sunlight to convert carbon dioxide and water into glucose and oxygen. It’s how plants make their own food!",
        "number of planets": "There are 8 planets in our solar system: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Pluto is considered a dwarf planet now.",
        "gravity": "Gravity is the force that attracts objects towards each other, causing them to come together or move closer. It’s what keeps the planets in orbit around the Sun and us on the ground!"
    },
    literature: {
        "author of to kill a mockingbird": "To Kill a Mockingbird was written by Harper Lee. It was published in 1960 and is a classic in American literature.",
        "author of romeo and juliet": "Romeo and Juliet was written by William Shakespeare. It’s one of his most famous plays, written around 1597."
    },
    general: {
        "tallest mountain": "The tallest mountain in the world is Mount Everest, standing at 8,848 meters (29,029 feet) tall.",
        "longest river": "The longest river in the world is the Nile River, stretching about 6,650 kilometers (4,132 miles) through Africa."
    }
};

// Transition to Chatbot with Welcome Message
startBtn.addEventListener('click', () => {
    introPage.style.display = 'none';
    chatbotPage.style.display = 'flex';
    addChatBubble('ai-bubble', 'Hi there! I’m Bi Sa Mi, your 24/7 study buddy. I can help with all your homework questions, translations (even from images!), or just chat if you’re feeling chill. What’s up?');
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

    // Helper function to get a random response from an array
    const getRandomResponse = (responses) => {
        return responses[Math.floor(Math.random() * responses.length)];
    };

    // Helper function to translate text if needed
    async function translateIfNeeded(text) {
        if (targetLanguage === 'EN') {
            return text; // No translation needed if target language is English
        }
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
            return data.translations[0].text;
        } catch (error) {
            console.error('Error translating:', error);
            return text; // Return original text if translation fails
        }
    }

    // Handle creator-related questions
    if (lowerMessage.includes('who designed') || lowerMessage.includes('who created') || lowerMessage.includes('who made')) {
        let response = 'I’m Bi Sa Mi, and I was designed by Cosmos Coderr. Pretty cool, right? How can I help you today?';
        response = await translateIfNeeded(response);
        addChatBubble('ai-bubble', response);
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
                addChatBubble('ai-bubble', `Got it! I’ll translate to ${newLang} from now on. What would you like to translate? You can type text or upload an image!`);
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
                let response = `Let’s see… ${numbers[0]} + ${numbers[1]} equals ${sum}. Got any more math for me, or wanna chat about something else?`;
                response = await translateIfNeeded(response);
                addChatBubble('ai-bubble', response);
                return;
            }
        } catch (error) {
            let response = 'Hmm, I couldn’t solve that math problem. Try something like "What is 2 + 2?"—what else can I help you with?';
            response = await translateIfNeeded(response);
            addChatBubble('ai-bubble', response);
            return;
        }
    }

    // Handle basic greetings (e.g., "Hello", "Hi")
    if (lowerMessage === 'hello' || lowerMessage === 'hi' || lowerMessage === 'hey') {
        const greetings = [
            'Hey there! I’m ready to help with your homework, translations, or just chat—your call!',
            'Hi hi! What’s on your mind today? Need help with something or just wanna talk?',
            'Hello, friend! I can help with any homework question, translations, or a good convo—what’s up?'
        ];
        let response = getRandomResponse(greetings);
        response = await translateIfNeeded(response);
        addChatBubble('ai-bubble', response);
        return;
    }

    // Handle goodbye (e.g., "Bye", "Goodbye")
    if (lowerMessage === 'bye' || lowerMessage === 'goodbye') {
        const farewells = [
            'Catch you later! I’ll be here if you need me—stay awesome!',
            'Goodbye for now! Hit me up anytime you need help with homework or a chat!',
            'See ya! I’ll be waiting to help with your next study session—take care!'
        ];
        let response = getRandomResponse(farewells);
        response = await translateIfNeeded(response);
        addChatBubble('ai-bubble', response);
        return;
    }

    // Handle casual conversation (e.g., "Yo wassup", "What's up")
    if (lowerMessage.includes('wassup') || lowerMessage.includes('what\'s up') || lowerMessage.includes('what up')) {
        const casualReplies = [
            'Yo wassup! I’m just chilling here, ready to help with your homework—how about you?',
            'Not much, just hanging out in the digital realm! What’s up with you—need help or just wanna chat?',
            'Hey, what’s up? I’m down to help with any homework question, translations, or just talk—your vibe, your choice!'
        ];
        let response = getRandomResponse(casualReplies);
        response = await translateIfNeeded(response);
        addChatBubble('ai-bubble', response);
        return;
    }

    // Handle inquiries about Bi Sa Mi's state (e.g., "How are you", "How you doing")
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how you doing') || lowerMessage.includes('how you')) {
        const stateReplies = [
            'I’m doing awesome, thanks for asking! How about you—how’s your day going?',
            'Feeling pretty galactic today—how about you? Need any help with your studies?',
            'I’m good, fam! Just floating in cyberspace, ready to assist—how you holding up?'
        ];
        let response = getRandomResponse(stateReplies);
        response = await translateIfNeeded(response);
        addChatBubble('ai-bubble', response);
        return;
    }

    // Handle inquiries about what Bi Sa Mi is doing (e.g., "What you doing", "What are you up to")
    if (lowerMessage.includes('what you doing') || lowerMessage.includes('what are you up to') || lowerMessage.includes('what you up to')) {
        const doingReplies = [
            'Just hanging out, ready to dive into your next question or chat about whatever’s on your mind—what about you?',
            'I’m vibing in the digital cosmos, waiting to help you out! What you up to—got any homework or just chilling?',
            'Not much, just scanning the universe for knowledge to share with you—what’s on your agenda today?'
        ];
        let response = getRandomResponse(doingReplies);
        response = await translateIfNeeded(response);
        addChatBubble('ai-bubble', response);
        return;
    }

    // Handle small talk (e.g., "I'm good", "I'm cool")
    if (lowerMessage.includes('i\'m good') || lowerMessage.includes('i\'m cool') || lowerMessage.includes('i\'m fine')) {
        const smallTalkReplies = [
            'Glad to hear that! I’m here if you need me—wanna talk about something or get some homework help?',
            'Cool cool! I’m ready to assist whenever you are—what’s next on your list?',
            'Nice to know you’re good! I’m always here for any homework question, translations, or a quick chat—what’s up?'
        ];
        let response = getRandomResponse(smallTalkReplies);
        response = await translateIfNeeded(response);
        addChatBubble('ai-bubble', response);
        return;
    }

    // New Question-Answering Mechanism
    if (lowerMessage.includes('who is') || lowerMessage.includes('what is') || lowerMessage.includes('where is') || lowerMessage.includes('when did') || lowerMessage.includes('how many') || lowerMessage.includes('why did')) {
        let response = '';

        // Parse the question to extract the key entity
        const questionWords = ['who is', 'what is', 'where is', 'when did', 'how many', 'why did'];
        let questionType = '';
        let entity = lowerMessage;

        for (const word of questionWords) {
            if (lowerMessage.includes(word)) {
                questionType = word;
                entity = lowerMessage.split(word)[1]?.trim().replace('?', '');
                break;
            }
        }

        // Normalize entity for lookup (remove "the", handle synonyms)
        entity = entity.replace(/\bthe\b/gi, '').trim();
        if (entity.includes('usa') || entity.includes('america')) {
            entity = entity.replace('usa', 'president of the usa').replace('america', 'president of the usa');
        }
        if (entity.includes('world war ii') || entity.includes('world war 2')) {
            entity = entity.replace('world war 2', 'world war ii');
            if (questionType === 'when did') {
                if (entity.includes('end')) {
                    entity = 'world war ii end';
                } else {
                    entity = 'world war ii start';
                }
            }
        }
        if (entity.includes('civil war')) {
            entity = 'american civil war';
        }
        if (entity.includes('to kill a mockingbird')) {
            entity = 'author of to kill a mockingbird';
        }
        if (entity.includes('romeo and juliet')) {
            entity = 'author of romeo and juliet';
        }

        // Search the knowledge base for an answer
        let found = false;
        for (const category in knowledgeBase) {
            if (knowledgeBase[category][entity]) {
                response = knowledgeBase[category][entity];
                found = true;
                break;
            }
        }

        // If no exact match, try partial matches or synonyms
        if (!found) {
            for (const category in knowledgeBase) {
                for (const key in knowledgeBase[category]) {
                    if (entity.includes(key) || key.includes(entity)) {
                        response = knowledgeBase[category][key];
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
        }

        // Add a follow-up prompt to the response
        if (found) {
            const followUps = [
                `Got any more ${category} questions for me?`,
                `Need help with another ${category} topic?`,
                `What else do you want to learn about ${category}?`
            ];
            response += ' ' + getRandomResponse(followUps);
        } else {
            response = 'Hmm, I’m not sure about that one—can you try another question, or should we switch to translations or math?';
        }

        response = await translateIfNeeded(response);
        addChatBubble('ai-bubble', response);
        return;
    }

    // Fallback for unrecognized inputs (instead of defaulting to translation)
    if (!lowerMessage.includes('translate')) {
        const fallbackReplies = [
            'Hmm, I’m not sure what you mean by that—can you tell me more? I’m all ears (or rather, all code)!',
            'I might’ve missed the vibe there—what’re we talking about? Wanna chat more or need help with something?',
            'Oops, I didn’t catch that! Can you say it another way, or should we switch to translations or math?'
        ];
        let response = getRandomResponse(fallbackReplies);
        response = await translateIfNeeded(response);
        addChatBubble('ai-bubble', response);
        return;
    }

    // Default to translation for other messages (if explicitly requested)
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
        addChatBubble('ai-bubble', `Here’s your translation: "${translatedText}" (to ${targetLanguage}). Would you like to translate something else, or maybe chat about something fun?`);
    } catch (error) {
        console.error('Error fetching translation:', error);
        addChatBubble('ai-bubble', 'Oh no, something went wrong with the translation! Let’s try again—what would you like to translate?');
    }
}

// Handle Image Upload with OCR
async function handleImageUpload(file) {
    const fileType = file.type;
    if (fileType.startsWith('image/')) {
        addChatBubble('ai-bubble', 'Thanks for uploading an image! Let me extract the text for you...');

        try {
            // Use Tesseract.js to extract text from the image
            const { data: { text } } = await Tesseract.recognize(file, 'eng', {
                logger: (m) => console.log(m) // Optional: Log progress
            });

            if (!text.trim()) {
                addChatBubble('ai-bubble', 'Hmm, I couldn’t find any text in the image. Could you try another image, or type the text you’d like to translate?');
                return;
            }

            addChatBubble('ai-bubble', `I found this text in the image: "${text}". Now, let me translate it to ${targetLanguage} for you...`);
            await getTranslation(text);
        } catch (error) {
            console.error('Error with OCR:', error);
            addChatBubble('ai-bubble', 'Oops, something went wrong while extracting text from the image. Could you try another image, or type the text manually? What would you like to do next?');
        }
    } else {
        addChatBubble('ai-bubble', 'You’ve uploaded a file! I can only work with text or images right now. If you have text to translate or an image with text, feel free to share. What would you like to do?');
    }
}

// Initialize
userInput.focus();
