import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion } from 'framer-motion';

export default function Auth({ palette, accent }) {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (!isLogin && !name.trim()) { setError('Please enter your name.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const displayName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        await updateProfile(cred.user, { displayName });
        await setDoc(doc(db, 'users', cred.user.uid), {
          name: displayName,
          nameLower: displayName.toLowerCase(),
          email: normalizedEmail,
          emailLower: normalizedEmail,
          uid: cred.user.uid,
          privacy: { showEmail: false, showOnline: true, readReceipts: true },
          notifications: { messages: true, mentions: true, sounds: true },
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use' ? 'An account with this email already exists.'
        : err.code === 'auth/invalid-credential' ? 'Incorrect email or password.'
        : err.code === 'auth/invalid-email' ? 'Invalid email address.'
        : 'Something went wrong. Please try again.';
      setError(msg);
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '13px 16px',
    background: palette.input,
    border: `1px solid ${palette.accentBorder}`,
    borderRadius: '10px',
    color: palette.text,
    fontSize: '15px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: '500',
    color: palette.muted,
    display: 'block',
    marginBottom: '6px'
  };

  return (
    <div style={{ minHeight: '100vh', background: palette.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', background: accent, borderRadius: '16px', marginBottom: '1rem', fontSize: '15px', fontWeight: 800, color: '#fff' }}>
            Chat
          </div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: palette.text, letterSpacing: '0' }}>OMTECH Chat</div>
          <div style={{ fontSize: '14px', color: palette.muted, marginTop: '4px' }}>
            {isLogin ? 'Welcome back. Sign in to continue.' : 'Create an account to get started.'}
          </div>
        </div>

        <div style={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: '12px', padding: '2rem', boxShadow: palette.shadow }}>
          {!isLogin && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Full name</label>
              <input
                style={inputStyle}
                placeholder="Joseph"
                value={name}
                onChange={e => setName(e.target.value)}
                onFocus={e => e.target.style.borderColor = '#185FA5'}
                onBlur={e => e.target.style.borderColor = palette.accentBorder}
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Email</label>
            <input
              style={inputStyle}
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#185FA5'}
              onBlur={e => e.target.style.borderColor = palette.accentBorder}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Password</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#185FA5'}
              onBlur={e => e.target.style.borderColor = palette.accentBorder}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: palette.danger, fontSize: '13px', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: '100%', padding: '13px', background: accent, border: 'none', color: palette.buttonText, borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '13px', color: palette.muted, marginTop: '1.25rem' }}>
            {isLogin ? 'New here? ' : 'Already have an account? '}
            <span style={{ color: palette.icon, cursor: 'pointer', fontWeight: '600' }} onClick={() => { setIsLogin(!isLogin); setError(''); }}>
              {isLogin ? 'Create account' : 'Sign in'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
