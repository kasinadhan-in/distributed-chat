# 💬 Distributed Chat System with Vector Clock Ordering

A real-time distributed chat system built using **Node.js**, **Express**, and **Socket.IO**, featuring vector clocks and FIFO buffering for message ordering. It includes a modern chat interface with support for text, emojis, image uploads, typing indicators, and dark mode.

---

## 🚀 Features

- ✅ Real-time bi-directional chat via **Socket.IO**
- ✅ **Vector Clock** and **FIFO buffering** for logical message ordering
- ✅ Fully responsive **web UI** (HTML, CSS, JavaScript)
- ✅ Send **text messages**, **emoji stickers**, and **images**
- ✅ **Typing indicator**
- ✅ **Clear Chat** feature
- ✅ **Light/Dark theme** toggle
- ✅ Image preview in new tab
- ✅ Random delay to simulate message reordering

---

## 🛠️ Tech Stack

| Layer     | Technology                         |
|-----------|-------------------------------------|
| Frontend  | HTML, CSS, JavaScript               |
| Backend   | Node.js, Express, Socket.IO         |
| Uploads   | Multer for image upload             |
| Ordering  | Vector Clock & FIFO buffer (custom) |

---

## 📁 Project Structure

```
distributed-chat/
│
├── client/                  # Frontend files
│   ├── index.html
│   └── script.js
│
├── server/                  # Backend files
│   ├── index.js
│   └── vectorClock.js
│
├── uploads/                 # Image uploads folder (auto-created)
│
├── package.json             # Project dependencies
└── package-lock.json        # Dependency versions lock
```

---

## ⚙️ Setup & Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/your-username/distributed-chat.git
cd distributed-chat
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `uploads/` folder (for storing image messages)

```bash
mkdir uploads
```

### 4. Start the server

```bash
node server/index.js
```

The server will start on:

```
http://localhost:3000
```

---

## 🌐 Access the Chat Interface

- Open your browser and go to:  
  [http://localhost:3000](http://localhost:3000)

- Enter a **username** to join the chat.

---

## 👥 Test Multi-User Messaging

- Open the same URL in **two different browser windows** or **two devices**.
- Try sending messages, images, stickers, and watch message ordering with **Vector Clock** and **FIFO buffer** logic in action.

---

## 📤 Deployment (Future)

You can deploy this app using platforms like:

- [Render](https://render.com/)
- [Railway](https://railway.app/)
- [Vercel + API proxy setup](https://vercel.com/)
- Or use **dev tunnels** / **ngrok** for sharing your localhost.

---

## 📌 Notes

- Make sure `uploads/` is included in `.gitignore` — don't commit user-uploaded images.
- `package-lock.json` ensures consistent installs — keep it committed.
- Fully compatible with future enhancements like **Vector Clock Visualization**, **Message Logging**, or **Database Integration**.

---

## 👨‍💻 Author

- **Kasinadhan S**  
  [GitHub Profile](https://github.com/your-username)

---

## 📄 License

This project is open-source and available under the **MIT License**.
