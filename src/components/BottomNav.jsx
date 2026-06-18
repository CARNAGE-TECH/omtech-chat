import { FiHome, FiMessageCircle, FiUser, FiSettings } from 'react-icons/fi';

export default function BottomNav({ activeTab, setActiveTab, palette }) {
  const tabs = [
    { id: 'rooms', icon: FiHome, label: 'Rooms' },
    { id: 'chats', icon: FiMessageCircle, label: 'Chats' },
    { id: 'settings', icon: FiSettings, label: 'Settings' },
    { id: 'profile', icon: FiUser, label: 'Profile' }
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: palette.elevated, backdropFilter: 'blur(12px)',
      borderTop: `1px solid ${palette.border}`,
      display: 'flex', justifyContent: 'space-around',
      padding: '10px 0 calc(10px + env(safe-area-inset-bottom))',
      zIndex: 100
    }}>
      {tabs.map(({ id, icon: Icon, label }) => (
        <button key={id} onClick={() => setActiveTab(id)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            color: activeTab === id ? palette.icon : palette.muted,
            fontFamily: 'inherit', padding: '4px 24px', transition: 'color 0.2s'
          }}>
          <Icon size={22} />
          <span style={{ fontSize: '11px', fontWeight: '500' }}>{label}</span>
        </button>
      ))}
    </div>
  );
}
