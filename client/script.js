let socket;
let username = "";
let sequenceNumber = 0;
let vectorClock = {};
let typingTimeout;
let isTyping = false;
let currentTheme = 'light';

function joinChat() {
  const input = document.getElementById("usernameInput");
  username = input.value.trim();
  
  if (!username) {
    showNotification("Please enter a username!");
    return;
  }

  document.getElementById("login").style.display = "none";
  document.getElementById("chat").style.display = "flex";

  socket = io();

  // Notify server about new user
  socket.emit("newUser", username);

  // Handle incoming messages
  socket.on("message", (msg) => {
    displayMessage(msg);
    scrollToBottom();
  });

  // Handle chat cleared event
  socket.on("chatCleared", () => {
    document.getElementById("messages").innerHTML = "";
    displaySystemMessage("Chat has been cleared");
  });

  // Handle user count updates
  socket.on("userCount", (count) => {
    document.getElementById("userCount").textContent = `${count} online`;
  });

  // Handle system messages
  socket.on("systemMessage", (message) => {
    displaySystemMessage(message);
    scrollToBottom();
  });

  // Handle typing indicators
  socket.on("typing", (data) => {
    if (data.username !== username) {
      const typingIndicator = document.getElementById("typingIndicator");
      typingIndicator.textContent = `${data.username} is typing...`;
      typingIndicator.style.display = "block";
      
      // Hide after 3 seconds
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        typingIndicator.style.display = "none";
      }, 3000);
    }
  });

  // Handle stop typing
  socket.on("stopTyping", (data) => {
    if (data.username !== username) {
      document.getElementById("typingIndicator").style.display = "none";
    }
  });

  // Focus input field after joining
  document.getElementById("m").focus();
}

function displayMessage(msg) {
  const messages = document.getElementById("messages");
  const li = document.createElement("li");
  
  const timestamp = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Message metadata (username and time)
  const metaDiv = document.createElement("div");
  metaDiv.className = "message-meta";
  
  // Add badge for your own messages
  const badge = msg.username === username ? '<span class="badge">You</span>' : '';
  
  metaDiv.innerHTML = `
    <span class="message-username">${msg.username} ${badge}</span>
    <span class="message-time">${timestamp}</span>
  `;
  li.appendChild(metaDiv);

  // Message content
  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";
  
  if (msg.type === "image") {
    contentDiv.innerHTML = `
      <img src="${msg.text}" alt="User uploaded image" 
           onclick="openImageModal('${msg.text}')" />
    `;
  } else if (msg.type === "sticker") {
    contentDiv.innerHTML = `<span style="font-size: 2.5rem;">${msg.text}</span>`;
  } else {
    contentDiv.textContent = msg.text;
  }
  li.appendChild(contentDiv);

  // Highlight current user's messages
  if (msg.username === username) {
    li.style.backgroundColor = "rgba(67, 97, 238, 0.1)";
    li.style.borderLeft = "3px solid var(--primary-color)";
  }

  messages.appendChild(li);
}

function displaySystemMessage(message) {
  const messages = document.getElementById("messages");
  const li = document.createElement("li");
  li.className = "system-message";
  li.textContent = message;
  messages.appendChild(li);
}

function sendMessage() {
  const input = document.getElementById("m");
  const text = input.value.trim();
  
  if (!text) return;

  const isImage = text.match(/\.(gif|jpg|jpeg|png|webp)$/i);
  const type = isImage ? "image" : "text";

  // Update vector clock
  vectorClock[socket.id] = (vectorClock[socket.id] || 0) + 1;

  socket.emit("message", {
    text,
    username,
    vectorClock,
    sequenceNumber,
    type,
    timestamp: Date.now()
  });

  // Notify that typing has stopped
  socket.emit("stopTyping", { username });
  isTyping = false;

  sequenceNumber++;
  input.value = "";
  input.focus();
  
  // Hide stickers panel if visible
  document.getElementById("stickersContainer").style.display = "none";
}

function sendSticker(emoji) {
  // Update vector clock
  vectorClock[socket.id] = (vectorClock[socket.id] || 0) + 1;

  socket.emit("message", {
    text: emoji,
    username,
    vectorClock,
    sequenceNumber,
    type: "sticker",
    timestamp: Date.now()
  });

  sequenceNumber++;
  
  // Hide stickers panel after sending
  document.getElementById("stickersContainer").style.display = "none";
}

function toggleStickers() {
  const stickersContainer = document.getElementById("stickersContainer");
  stickersContainer.style.display = stickersContainer.style.display === "flex" ? "none" : "flex";
}

function clearChat() {
  if (confirm("Are you sure you want to clear the chat?")) {
    socket.emit("clearChat");
  }
}

function scrollToBottom() {
  const messages = document.getElementById("messages");
  messages.scrollTop = messages.scrollHeight;
}

function showNotification(message) {
  const notification = document.getElementById("notification");
  const notificationText = document.getElementById("notificationText");
  
  notificationText.textContent = message;
  notification.classList.add("show");
  
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

function toggleTheme() {
  const body = document.body;
  const themeIcon = document.querySelector('.theme-switcher i');
  
  if (currentTheme === 'light') {
    body.classList.add('dark-theme');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
    currentTheme = 'dark';
  } else {
    body.classList.remove('dark-theme');
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
    currentTheme = 'light';
  }
}

function openImageModal(src) {
  // In a real app, you would implement a proper modal here
  window.open(src, '_blank');
}

// Handle typing detection
document.getElementById("m").addEventListener("input", (e) => {
  if (!isTyping && e.target.value.trim()) {
    socket.emit("typing", { username });
    isTyping = true;
  } else if (isTyping && !e.target.value.trim()) {
    socket.emit("stopTyping", { username });
    isTyping = false;
  }
});

// Handle Enter key for sending messages
document.getElementById("m").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// Handle Escape key to close stickers panel
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.getElementById("stickersContainer").style.display = "none";
  }
});

// Initialize theme from localStorage if available
function initTheme() {
  const savedTheme = localStorage.getItem('chatTheme');
  if (savedTheme === 'dark') {
    toggleTheme();
  }
}

// Call initTheme when page loads
window.onload = initTheme;