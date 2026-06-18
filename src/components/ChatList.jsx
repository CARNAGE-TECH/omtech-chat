import { useEffect, useState } from 'react';
import { collection, documentId, endAt, getDocs, limit, onSnapshot, orderBy, query, startAt, where } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { FiSearch, FiUser } from 'react-icons/fi';

export default function ChatList({ user, onOpenChat, palette, accent }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [recentChats, setRecentChats] = useState([]);
  const [otherUsers, setOtherUsers] = useState({});

  useEffect(() => {
    const q = query(collection(db, 'dms'), where('participants', 'array-contains', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setRecentChats(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user.uid]);

  useEffect(() => {
    const ids = [...new Set(recentChats.flatMap(chat => chat.participants || []).filter(uid => uid && uid !== user.uid))];
    if (ids.length === 0) {
      setOtherUsers({});
      return;
    }

    const fetchUsers = async () => {
      const map = {};
      for (let i = 0; i < ids.length; i += 10) {
        const chunk = ids.slice(i, i + 10);
        const snap = await getDocs(query(collection(db, 'users'), where(documentId(), 'in', chunk)));
        snap.docs.forEach(d => { map[d.id] = { id: d.id, ...d.data() }; });
      }
      setOtherUsers(map);
    };

    fetchUsers();
  }, [recentChats, user.uid]);

  const normalizeUser = (u) => ({
    ...u,
    name: u.name || 'User',
    privacy: { showEmail: false, showOnline: true, readReceipts: true, ...(u.privacy || {}) }
  });

  const handleSearch = async (val) => {
    setSearch(val);
    const term = val.trim().toLowerCase();
    if (!term) { setResults([]); return; }

    setSearching(true);
    try {
      const usersRef = collection(db, 'users');
      const searches = [
        query(usersRef, orderBy('nameLower'), startAt(term), endAt(`${term}\uf8ff`), limit(8)),
        query(usersRef, orderBy('emailLower'), startAt(term), endAt(`${term}\uf8ff`), limit(8))
      ];
      const snaps = await Promise.all(searches.map(getDocs));
      const map = new Map();
      snaps.flatMap(snap => snap.docs).forEach(d => {
        const data = normalizeUser({ id: d.id, ...d.data() });
        if (data.uid !== user.uid) map.set(data.uid || d.id, data);
      });
      setResults([...map.values()].slice(0, 10));
    } catch {
      setResults([]);
    }
    setSearching(false);
  };

  const openDM = (otherUser) => {
    const otherUid = otherUser.uid || otherUser.id;
    const dmId = [user.uid, otherUid].sort().join('_');
    onOpenChat({ id: dmId, name: otherUser.name, type: 'dm', otherUserId: otherUid, participants: [user.uid, otherUid] });
  };

  const getOtherParticipant = (chat) => chat.participants?.find(p => p !== user.uid);
  const visibleEmail = (u) => u?.privacy?.showEmail ? u.email : 'Email hidden';

  const cardStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    background: palette.surface,
    border: `1px solid ${palette.border}`,
    borderRadius: '12px',
    padding: '12px 16px',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
    boxShadow: palette.shadow,
    width: '100%'
  };

  return (
    <div style={{ padding: '1.5rem 1rem' }}>
      <div style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '0', marginBottom: '1.5rem' }}>Direct Messages</div>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <FiSearch size={16} color={palette.muted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input value={search} onChange={e => handleSearch(e.target.value)}
          placeholder="Search users by name or email..."
          style={{ width: '100%', padding: '12px 16px 12px 40px', background: palette.input, border: `1px solid ${palette.accentBorder}`, borderRadius: '10px', color: palette.text, fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
      </div>

      {search && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '11px', color: palette.muted, fontWeight: '600', letterSpacing: '0.8px', marginBottom: '8px' }}>SEARCH RESULTS</div>
          {searching ? (
            <div style={{ color: palette.muted, fontSize: '13px', padding: '1rem 0' }}>Searching...</div>
          ) : results.length === 0 ? (
            <div style={{ color: palette.subtle, fontSize: '13px', padding: '1rem 0' }}>No users found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {results.map(u => (
                <motion.button key={u.uid || u.id} whileTap={{ scale: 0.98 }} onClick={() => openDM(u)} style={cardStyle}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: palette.buttonText, flexShrink: 0 }}>
                    {u.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: palette.text }}>{u.name}</div>
                    <div style={{ fontSize: '12px', color: palette.muted }}>{visibleEmail(u)}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: '11px', color: palette.muted, fontWeight: '600', letterSpacing: '0.8px', marginBottom: '8px' }}>RECENT CHATS</div>
      {recentChats.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: palette.subtle, fontSize: '14px' }}>
          <FiUser size={32} style={{ display: 'block', margin: '0 auto 8px', opacity: 0.45 }} />
          No conversations yet. Search for someone to start chatting.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recentChats.map(chat => {
            const otherUid = getOtherParticipant(chat);
            const otherUser = normalizeUser(otherUsers[otherUid] || {});
            if (!otherUid || !otherUser.uid) return null;
            return (
              <motion.button key={chat.id} whileTap={{ scale: 0.98 }}
                onClick={() => onOpenChat({ id: chat.id, name: otherUser.name, type: 'dm', otherUserId: otherUid, participants: chat.participants })}
                style={cardStyle}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: palette.buttonText, flexShrink: 0 }}>
                  {otherUser.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: palette.text }}>{otherUser.name}</div>
                  <div style={{ fontSize: '12px', color: palette.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.lastMessage || 'No messages yet'}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
