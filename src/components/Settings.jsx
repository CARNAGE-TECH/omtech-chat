import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMoon, FiSun, FiBell, FiShield, FiUser, FiLock, FiInfo, FiChevronRight, FiX, FiCheck } from 'react-icons/fi';

export default function Settings({ user, theme, setTheme }) {
  const [section, setSection] = useState(null);
  const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem('notif_settings') || '{"messages":true,"mentions":true,"sounds":true}'));
  const [privacy, setPrivacy] = useState(() => JSON.parse(localStorage.getItem('privacy_settings') || '{"showEmail":false,"showOnline":true,"readReceipts":true}'));
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const saveNotifications = (key, val) => {
    const updated = { ...notifications, [key]: val };
    setNotifications(updated);
    localStorage.setItem('notif_settings', JSON.stringify(updated));
  };

  const savePrivacy = (key, val) => {
    const updated = { ...privacy, [key]: val };
    setPrivacy(updated);
    localStorage.setItem('privacy_settings', JSON.stringify(updated));
  };

  const updateName = async () => {
    if (!displayName.trim()) return;
    setLoading(true);
    setError('');
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      await updateDoc(doc(db, 'users', user.uid), { name: displayName.trim() });
      setMsg('Display name updated!');
      setTimeout(() => setMsg(''), 3000);
    } catch { setError('Failed to update name.'); }
    setLoading(false);
  };

  const changePassword = async () => {
    if (!newPassword || !currentPassword) { setError('Please fill in both fields.'); return; }
    if (newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setMsg('Password changed successfully!');
      setNewPassword('');
      setCurrentPassword('');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError(err.code === 'auth/wrong-password' ? 'Current password is incorrect.' : 'Failed to change password.');
    }
    setLoading(false);
  };

  const isDark = theme === 'dark';

  const Toggle = ({ value, onChange }) => (
    <div onClick={() => onChange(!value)}
      style={{ width: '44px', height: '24px', background: value ? 'linear-gradient(135deg, #185FA5, #2b8dd4)' : 'rgba(255,255,255,0.15)', borderRadius: '99px', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: '3px', left: value ? '23px' : '3px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: 'left 0.2s' }} />
    </div>
  );

  const inputStyle = {
    width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(24,95,165,0.25)', borderRadius: '10px',
    color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
  };

  const sections = [
    { id: 'appearance', icon: <FiSun size={16} />, title: 'Appearance', desc: 'Theme and display options' },
    { id: 'notifications', icon: <FiBell size={16} />, title: 'Notifications', desc: 'Manage notification preferences' },
    { id: 'privacy', icon: <FiShield size={16} />, title: 'Privacy', desc: 'Control your privacy settings' },
    { id: 'account', icon: <FiUser size={16} />, title: 'Account', desc: 'Update your profile and name' },
    { id: 'security', icon: <FiLock size={16} />, title: 'Security', desc: 'Change your password' },
    { id: 'about', icon: <FiInfo size={16} />, title: 'About', desc: 'App info and version' }
  ];

  return (
    <div style={{ padding: '1.5rem 1rem', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        {section && (
          <button onClick={() => { setSection(null); setError(''); setMsg(''); }}
            style={{ background: 'none', border: 'none', color: '#90cdf4', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <FiX size={20} />
          </button>
        )}
        <div style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.3px' }}>
          {section ? sections.find(s => s.id === section)?.title : 'Settings'}
        </div>
      </div>

      {msg && (
        <div style={{ background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#86efac', fontSize: '13px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCheck size={14} /> {msg}
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#fc8181', fontSize: '13px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {!section ? (
          <motion.div key="menu" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sections.map(s => (
              <button key={s.id} onClick={() => setSection(s.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', width: '100%' }}>
                <div style={{ background: 'rgba(24,95,165,0.15)', borderRadius: '8px', padding: '8px', color: '#90cdf4', flexShrink: 0 }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{s.title}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{s.desc}</div>
                </div>
                <FiChevronRight size={16} color="rgba(255,255,255,0.3)" />
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div key={section} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>

            {/* Appearance */}
            {section === 'appearance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isDark ? <FiMoon size={18} color="#90cdf4" /> : <FiSun size={18} color="#90cdf4" />}
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>Dark mode</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Currently {isDark ? 'on' : 'off'}</div>
                    </div>
                  </div>
                  <Toggle value={isDark} onChange={(val) => setTheme(val ? 'dark' : 'light')} />
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '10px' }}>Chat bubble color</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['#185FA5', '#6D28D9', '#065F46', '#B45309', '#9D174D'].map(color => (
                      <button key={color} onClick={() => { localStorage.setItem('bubble_color', color); window.location.reload(); }}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', background: color, border: localStorage.getItem('bubble_color') === color ? '3px solid white' : '3px solid transparent', cursor: 'pointer' }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {section === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  ['messages', 'New messages', 'Get notified about new messages'],
                  ['mentions', 'Mentions', 'Get notified when someone mentions you'],
                  ['sounds', 'Sound effects', 'Play sounds for new messages']
                ].map(([key, title, desc]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 16px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{title}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{desc}</div>
                    </div>
                    <Toggle value={notifications[key]} onChange={(val) => saveNotifications(key, val)} />
                  </div>
                ))}
              </div>
            )}

            {/* Privacy */}
            {section === 'privacy' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  ['showEmail', 'Show email to others', 'Others can see your email address'],
                  ['showOnline', 'Show online status', 'Others can see when you\'re online'],
                  ['readReceipts', 'Read receipts', 'Let others know when you\'ve read their messages']
                ].map(([key, title, desc]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 16px' }}>
                    <div style={{ flex: 1, marginRight: '12px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{title}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{desc}</div>
                    </div>
                    <Toggle value={privacy[key]} onChange={(val) => savePrivacy(key, val)} />
                  </div>
                ))}
              </div>
            )}

            {/* Account */}
            {section === 'account' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>Display name</label>
                  <input value={displayName} onChange={e => setDisplayName(e.target.value)} style={inputStyle} placeholder="Your name" />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>Email</label>
                  <input value={user.email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
                </div>
                <button onClick={updateName} disabled={loading}
                  style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #185FA5, #2b8dd4)', border: 'none', color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            )}

            {/* Security */}
            {section === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>Current password</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={inputStyle} placeholder="••••••••" />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>New password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} placeholder="••••••••" />
                </div>
                <button onClick={changePassword} disabled={loading}
                  style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #185FA5, #2b8dd4)', border: 'none', color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Changing...' : 'Change password'}
                </button>
              </div>
            )}

            {/* About */}
            {section === 'about' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  ['App name', 'OMTECH Chat'],
                  ['Version', '1.0.0'],
                  ['Developer', 'Joseph Omokwale'],
                  ['Company', 'OMTECH INNOVATORS'],
                  ['Based in', 'Edo State, Nigeria'],
                  ['Built with', 'React + Firebase']
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>{label}</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{val}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}