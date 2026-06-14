import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { FiLogOut, FiMail, FiUser } from 'react-icons/fi';

export default function Profile({ user }) {
  return (
    <div style={{ padding: '1.5rem 1rem' }}>
      <div style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.3px', marginBottom: '1.5rem' }}>Profile</div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #185FA5, #2b8dd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '700', color: '#0a0a0a', marginBottom: '1rem' }}>
          {(user.displayName || user.email)[0].toUpperCase()}
        </div>
        <div style={{ fontSize: '18px', fontWeight: '700' }}>{user.displayName || 'User'}</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{user.email}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 16px' }}>
          <div style={{ background: 'rgba(212,175,55,0.15)', borderRadius: '8px', padding: '8px', color: '#185FA5' }}><FiUser size={16} /></div>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Display name</div>
            <div style={{ fontSize: '14px', fontWeight: '500', marginTop: '2px' }}>{user.displayName || 'Not set'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 16px' }}>
          <div style={{ background: 'rgba(212,175,55,0.15)', borderRadius: '8px', padding: '8px', color: '#185FA5' }}><FiMail size={16} /></div>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Email</div>
            <div style={{ fontSize: '14px', fontWeight: '500', marginTop: '2px' }}>{user.email}</div>
          </div>
        </div>
      </div>

      <button onClick={() => signOut(auth)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#fc8181', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
        <FiLogOut size={16} /> Sign out
      </button>

      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '12px', marginTop: '2rem', fontStyle: 'italic' }}>
        OMTECH Chat © 2026
      </div>
    </div>
  );
}