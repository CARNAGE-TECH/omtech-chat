# OMTECH Chat 💬

> A real-time full-stack chat application with public rooms, shareable room codes, private direct messaging, media uploads, emoji picker, GIF search, typing indicators, and a comprehensive settings panel — built with React and Firebase.

**Live Demo:** *(paste your Vercel link here)*
**GitHub:** [github.com/CARNAGE-TECH/omtech-chat](https://github.com/CARNAGE-TECH/omtech-chat)

---

## Overview

OMTECH Chat is a production-ready real-time messaging application demonstrating full-stack capabilities with React and Firebase. It supports public chat rooms with unique shareable 6-character room codes, private 1-on-1 direct messages, real-time typing indicators, image and file uploads via Cloudinary, an emoji picker, GIF search via Tenor, and a full settings panel including dark/light mode, privacy controls, notification preferences, account management, and password change with reauthentication.

---

## Features

### Authentication
- Email and password signup and login via Firebase Auth
- User profiles stored in Firestore on registration
- Persistent sessions across page refreshes and revisits
- Secure sign out

### Public Rooms
- Create public chat rooms with custom names
- Each room automatically gets a unique **6-character shareable room code**
- Copy room code to clipboard with one tap
- Join any room by searching its name or entering its exact code
- Real-time message sync via Firestore `onSnapshot` listeners

### Direct Messages
- Search any registered user by name or email
- Start private 1-on-1 conversations instantly
- Recent DM conversations list with last message preview
- DM metadata updates in real time

### Real-Time Messaging
- Messages appear instantly for all participants — no refresh needed
- **Live typing indicators** — see when someone is typing in real time
- Message timestamps on every message
- Sender name display in group rooms (grouped by sender for clean UI)
- Messages animate in smoothly with Framer Motion

### Media and Attachments
- 📷 **Image uploads** — upload any image directly in chat via Cloudinary
- 📄 **File/document uploads** — share any file type via Cloudinary
- 😊 **Emoji picker** — full emoji library with search
- 🎞️ **GIF search** — search and send GIFs via Tenor API
- Tap any image to open it full size in a new tab

### Settings Panel
- **Appearance** — dark/light mode toggle, chat bubble color picker (5 color options)
- **Notifications** — toggle new message notifications, mention alerts, sound effects
- **Privacy** — control email visibility, online status display, read receipts
- **Account** — update display name synced to Firebase Auth and Firestore
- **Security** — change password with current password reauthentication
- **About** — app info, version, and developer details

### Design
- Blue and white color scheme
- Bottom navigation bar (mobile-first design)
- Smooth page and section transitions with Framer Motion
- Fully responsive across all screen sizes and devices

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend framework |
| Firebase Authentication | User auth and session management |
| Cloud Firestore | Real-time database for messages and user data |
| Cloudinary | Image and file upload/storage |
| Framer Motion | Animations and page transitions |
| React Icons | UI icon library |
| emoji-picker-react | Emoji picker component |
| Tenor API | GIF search and sending |
| Vercel | Deployment |

---

## Getting Started

### Prerequisites
- Node.js v16+
- npm
- Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- Cloudinary account at [cloudinary.com](https://cloudinary.com)

### Installation

```bash
git clone https://github.com/CARNAGE-TECH/omtech-chat.git
cd omtech-chat
npm install
npm start
```

### Firebase Configuration
Replace the config object in `src/firebase.js`:
```js
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
};
```

Enable **Email/Password Authentication** and create a **Firestore Database** in your Firebase console.

### Cloudinary Configuration
In `src/components/ChatRoom.jsx`:
```js
const CLOUD_NAME = 'your_cloud_name';
const UPLOAD_PRESET = 'your_unsigned_preset_name';
```

### Firestore Security Rules
rules_version = '2';

service cloud.firestore {

match /databases/{database}/documents {

match /{document=**} {

allow read, write: if request.auth != null;

}

}

}

---

## Project Structure

src/

├── firebase.js                  # Firebase app initialization and exports

├── App.js                       # Root with auth state, routing, theme management

└── components/

├── Auth.jsx                 # Email/password login and signup

├── BottomNav.jsx            # Bottom tab navigation bar

├── RoomsList.jsx            # Public rooms list, create room, join by code

├── ChatList.jsx             # DM list, user search, recent conversations

├── ChatRoom.jsx             # Real-time chat with media, emoji, GIF support

├── Profile.jsx              # User profile display and sign out

└── Settings.jsx             # Full settings panel with 6 sections

---

## Roadmap

- [ ] Push notifications via Firebase Cloud Messaging
- [ ] Voice messages with audio recording
- [ ] Message emoji reactions
- [ ] Message editing and deletion
- [ ] Group DMs with more than 2 participants
- [ ] End-to-end message encryption
- [ ] Real-time online/offline status indicators
- [ ] Message search within rooms

---

## Author

**Joseph Omokwale**
Freelance Web Developer & Designer
OMTECH INNOVATORS — *The Future of Tech...*
📍 Edo State, Nigeria
🌐 [omtech-portfolio.vercel.app](https://omtech-portfolio.vercel.app)
💼 [github.com/CARNAGE-TECH](https://github.com/CARNAGE-TECH)
📱 WhatsApp: [+234 807 638 4453](https://wa.me/2348076384453)
📸 Instagram: [@omtechinnovators](https://instagram.com/omtechinnovators)

---

## License
MIT License