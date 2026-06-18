# OMTECH Chat

Real-time chat with public rooms, shareable room codes, direct messages, media uploads, emoji, GIF search, typing indicators, and user settings. Built with React and Firebase.

**Live Demo:** add your Vercel link here  
**GitHub:** [github.com/CARNAGE-TECH/omtech-chat](https://github.com/CARNAGE-TECH/omtech-chat)

## Features

- Email/password authentication with Firebase Auth
- Public rooms with 6-character shareable room codes
- Private 1-on-1 direct messages
- Real-time messages and typing indicators with Firestore listeners
- Image/file uploads through Cloudinary
- Emoji picker and Tenor GIF search
- Dark/light mode and configurable chat bubble color
- Notification and privacy preferences saved to user profiles
- Profile name updates and password change with reauthentication

## Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend framework |
| Firebase Authentication | User auth and sessions |
| Cloud Firestore | Real-time messages, rooms, users, and settings |
| Cloudinary | Image and file upload/storage |
| Tenor API | GIF search |
| Framer Motion | UI transitions |
| React Icons | Icons |
| Vercel | Deployment |

## Getting Started

```bash
git clone https://github.com/CARNAGE-TECH/omtech-chat.git
cd omtech-chat
npm install
```

Create a local `.env` file from the template:

```bash
cp .env.example .env
```

Fill in:

```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
REACT_APP_TENOR_API_KEY=your_tenor_api_key
```

Run locally:

```bash
npm start
```

## Vercel Environment Variables

Yes, you need to add the Firebase values to Vercel after deploying.

In Vercel, open the project, go to **Settings -> Environment Variables**, and add every `REACT_APP_...` value from `.env.example`. Add the same Cloudinary and Tenor values too. After saving them, redeploy the app so Create React App can bake those variables into the production bundle.

## Firebase Setup

1. Enable Email/Password Authentication in Firebase Auth.
2. Create a Cloud Firestore database.
3. Publish the rules in `firestore.rules`.
4. Make sure new user documents include `nameLower` and `emailLower`; the current signup flow does this automatically.

## Cloudinary Setup

Create an unsigned upload preset and put the cloud name and preset in your `.env` / Vercel variables. For production, restrict the preset by file type, max file size, and allowed sources.

## Project Structure

```text
src/
  firebase.js
  theme.js
  App.js
  components/
    Auth.jsx
    BottomNav.jsx
    RoomsList.jsx
    ChatList.jsx
    ChatRoom.jsx
    Profile.jsx
    Settings.jsx
firestore.rules
```

## Roadmap

- Push notifications via Firebase Cloud Messaging
- Voice messages with audio recording
- Message emoji reactions
- Message editing and deletion
- Group DMs
- End-to-end message encryption
- Online/offline status indicators
- Message search within rooms

## Author

**Joseph Omokwale**  
Freelance Web Developer & Designer  
OMTECH INNOVATORS - The Future of Tech  
Edo State, Nigeria  
[Portfolio](https://omtech-portfolio.vercel.app)  
[GitHub](https://github.com/CARNAGE-TECH)  
[WhatsApp](https://wa.me/2348076384453)  
[Instagram](https://instagram.com/omtechinnovators)

## License

MIT License
