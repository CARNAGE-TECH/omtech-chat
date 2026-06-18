import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { FiLogOut, FiMail, FiUser } from 'react-icons/fi';

export default function Profile({ user, palette, accent }) {
  const cardStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: palette.surface,
    border: `1px solid ${palette.border}`,
    borderRadius: '12px',
    padding: '14px 16px',
    boxShadow: palette.shadow
  };

  return (
    <div style={{ padding: '1.5rem 1rem' }}>
      <div style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '0', marginBottom: '1.5rem' }}>Profile</div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '700', color: palette.buttonText, marginBottom: '1rem' }}>
          {(user.displayName || user.email)[0].toUpperCase()}
        </div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: palette.text }}>{user.displayName || 'User'}</div>
        <div style={{ fontSize: '13px', color: palette.muted, marginTop: '2px' }}>{user.email}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
        <div style={cardStyle}>
          <div style={{ background: palette.isDark ? 'rgba(24,95,165,0.15)' : '#e8f2fb', borderRadius: '8px', padding: '8px', color: palette.icon }}><FiUser size={16} /></div>
          <div>
            <div style={{ fontSize: '11px', color: palette.muted }}>Display name</div>
            <div style={{ fontSize: '14px', fontWeight: '500', marginTop: '2px', color: palette.text }}>{user.displayName || 'Not set'}</div>
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ background: palette.isDark ? 'rgba(24,95,165,0.15)' : '#e8f2fb', borderRadius: '8px', padding: '8px', color: palette.icon }}><FiMail size={16} /></div>
          <div>
            <div style={{ fontSize: '11px', color: palette.muted }}>Email</div>
            <div style={{ fontSize: '14px', fontWeight: '500', marginTop: '2px', color: palette.text }}>{user.email}</div>
          </div>
        </div>
      </div>

      <button onClick={() => signOut(auth)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: palette.danger, borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
        <FiLogOut size={16} /> Sign out
      </button>

      <div style={{ textAlign: 'center', color: palette.subtle, fontSize: '12px', marginTop: '2rem', fontStyle: 'italic' }}>
        OMTECH Chat © 2026
      </div>
    </div>
  );
}
