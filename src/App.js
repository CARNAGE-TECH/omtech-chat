import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Auth from './components/Auth';
import BottomNav from './components/BottomNav';
import RoomsList from './components/RoomsList';
import ChatList from './components/ChatList';
import ChatRoom from './components/ChatRoom';
import Profile from './components/Profile';
import Settings from './components/Settings';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rooms');
  const [activeChat, setActiveChat] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'dark');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    document.body.style.background = theme === 'dark' ? '#0a0a0a' : '#f0f2f5';
  }, [theme]);

  const bg = theme === 'dark' ? '#0a0a0a' : '#f0f2f5';
  const color = theme === 'dark' ? 'white' : '#111827';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#185FA5', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
        Loading...
      </div>
    );
  }

  if (!user) return <Auth />;

  if (activeChat) {
    return <ChatRoom chat={activeChat} user={user} onBack={() => setActiveChat(null)} theme={theme} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, color, fontFamily: "'Segoe UI', Arial, sans-serif", paddingBottom: '70px' }}>
      {activeTab === 'rooms' && <RoomsList user={user} onOpenChat={setActiveChat} theme={theme} />}
      {activeTab === 'chats' && <ChatList user={user} onOpenChat={setActiveChat} theme={theme} />}
      {activeTab === 'settings' && <Settings user={user} theme={theme} setTheme={setTheme} />}
      {activeTab === 'profile' && <Profile user={user} theme={theme} />}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
    </div>
  );
}