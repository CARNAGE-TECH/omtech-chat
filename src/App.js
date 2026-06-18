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
import { accentGradient, getPalette } from './theme';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rooms');
  const [activeChat, setActiveChat] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'dark');
  const [bubbleColor, setBubbleColor] = useState(() => localStorage.getItem('bubble_color') || '#185FA5');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    document.body.style.background = getPalette(theme).bg;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('bubble_color', bubbleColor);
  }, [bubbleColor]);

  const palette = getPalette(theme);
  const accent = accentGradient(bubbleColor);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: palette.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: palette.icon, fontFamily: "'Segoe UI', Arial, sans-serif" }}>
        Loading...
      </div>
    );
  }

  if (!user) return <Auth theme={theme} palette={palette} accent={accent} />;

  if (activeChat) {
    return <ChatRoom chat={activeChat} user={user} onBack={() => setActiveChat(null)} theme={theme} palette={palette} accent={accent} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: palette.bg, color: palette.text, fontFamily: "'Segoe UI', Arial, sans-serif", paddingBottom: '70px' }}>
      {activeTab === 'rooms' && <RoomsList user={user} onOpenChat={setActiveChat} palette={palette} accent={accent} />}
      {activeTab === 'chats' && <ChatList user={user} onOpenChat={setActiveChat} palette={palette} accent={accent} />}
      {activeTab === 'settings' && (
        <Settings
          user={user}
          theme={theme}
          setTheme={setTheme}
          bubbleColor={bubbleColor}
          setBubbleColor={setBubbleColor}
          palette={palette}
          accent={accent}
        />
      )}
      {activeTab === 'profile' && <Profile user={user} palette={palette} accent={accent} />}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} palette={palette} />
    </div>
  );
}
