import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion } from 'framer-motion';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (!isLogin && !name) { setError('Please enter your name.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        await setDoc(doc(db, 'users', cred.user.uid), {
          name,
          email,
          uid: cred.user.uid,
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
    width: '100%', padding: '13px 16px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(212,175,55,0.2)', borderRadius: '10px',
    color: 'white', fontSize: '15px', outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box', transition: 'border-color 0.2s'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ width: '100%', maxWidth: '400px' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', background: 'linear-gradient(135deg, #185FA5, #2b8dd4)', borderRadius: '16px', marginBottom: '1rem', fontSize: '28px' }}>
            💬
          </div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: 'white', letterSpacing: '-0.5px' }}>OMTECH Chat</div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
            {isLogin ? 'Welcome back. Sign in to continue.' : 'Create an account to get started.'}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '16px', padding: '2rem' }}>
          {!isLogin && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>Full name</label>
              <input style={inputStyle} placeholder="Joseph" value={name} onChange={e => setName(e.target.value)}
                onFocus={e => e.target.style.borderColor = '#185FA5'} onBlur={e => e.target.style.borderColor = 'rgba(212,175,55,0.2)'} />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>Email</label>
            <input style={inputStyle} type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#185FA5'} onBlur={e => e.target.style.borderColor = 'rgba(212,175,55,0.2)'} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>Password</label>
            <input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#185FA5'} onBlur={e => e.target.style.borderColor = 'rgba(212,175,55,0.2)'} />
          </div>

          {error && (
            <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#fc8181', fontSize: '13px', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #185FA5, #2b8dd4)', border: 'none', color: '#0a0a0a', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '1.25rem' }}>
            {isLogin ? 'New here? ' : 'Already have an account? '}
            <span style={{ color: '#185FA5', cursor: 'pointer', fontWeight: '600' }} onClick={() => { setIsLogin(!isLogin); setError(''); }}>
              {isLogin ? 'Create account' : 'Sign in'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}