import bot from './assets/srs.png';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
const options = ["Option 1", "Option 2"];

async function getBotResponse(conversation_history, user_input, options) {
  const response = await fetch('https://lincon-chat-bot.onrender.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: conversation_history + "\nUser: " + user_input + "\nChatbot:",
      options: options
    })
  });

  if (response.ok) {
    const data = await response.json();
    return data.bot.trim(); // trims any trailing spaces/'\n'
  } else {
    const err = await response.text();
    throw new Error(err);
  }
}

let loadInterval;

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    // Update the text content of the loading indicator
    element.textContent += '.';

    // If the loading indicator has reached three dots, reset it
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 19);
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img 
            src=${isAi ? bot : user} 
            alt="${isAi ? 'bot' : 'user'}" 
          />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
  `
  );
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  // to clear the textarea input 
  form.reset();

  // bot's chatstripe
  const conversation_history = chatContainer.textContent;
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // to focus scroll to the bottom 
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // specific message div 
  const messageDiv = document.getElementById(uniqueId);

  // messageDiv.innerHTML = "..."
  loader(messageDiv);

  try {
    const botResponse = await getBotResponse(conversation_history, data.get('prompt'), options);
    clearInterval(loadInterval);
    messageDiv.innerHTML = " ";
    typeText(messageDiv, botResponse);
  } catch (err) {
    clearInterval(loadInterval);
    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
};

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});

async function get_response(conversation_history, user_input, options) {
  const response = await fetch('https://lincon-chat-bot.onrender.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: conversation_history + "\nUser: " + user_input + "\nChatbot:",
      options: options,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get response from server');
  }

  const data = await response.json();
  return data.bot.trim();
}

