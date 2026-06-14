import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { FiSearch, FiUser } from 'react-icons/fi';

export default function ChatList({ user, onOpenChat }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [recentChats, setRecentChats] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'dms'), where('participants', 'array-contains', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const chats = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRecentChats(chats);
    });
    return () => unsub();
  }, [user.uid]);

  const handleSearch = async (val) => {
    setSearch(val);
    if (!val.trim()) { setResults([]); return; }
    setSearching(true);
    const snap = await getDocs(collection(db, 'users'));
    const all = snap.docs.map(d => d.data()).filter(u => u.uid !== user.uid);
    const filtered = all.filter(u => u.name.toLowerCase().includes(val.toLowerCase()) || u.email.toLowerCase().includes(val.toLowerCase()));
    setResults(filtered);
    setSearching(false);
  };

  const openDM = (otherUser) => {
    const dmId = [user.uid, otherUser.uid].sort().join('_');
    onOpenChat({ id: dmId, name: otherUser.name, type: 'dm', otherUserId: otherUser.uid, participants: [user.uid, otherUser.uid] });
  };

  const getOtherParticipant = (chat) => {
    return chat.participants?.find(p => p !== user.uid);
  };

  const [otherUsers, setOtherUsers] = useState({});
  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, 'users'));
      const map = {};
      snap.docs.forEach(d => { map[d.data().uid] = d.data(); });
      setOtherUsers(map);
    };
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: '1.5rem 1rem' }}>
      <div style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.3px', marginBottom: '1.5rem' }}>Direct Messages</div>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <FiSearch size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input value={search} onChange={e => handleSearch(e.target.value)}
          placeholder="Search users by name or email..."
          style={{ width: '100%', padding: '12px 16px 12px 40px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
      </div>

      {search && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: '0.8px', marginBottom: '8px' }}>SEARCH RESULTS</div>
          {searching ? (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', padding: '1rem 0' }}>Searching...</div>
          ) : results.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', padding: '1rem 0' }}>No users found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {results.map(u => (
                <motion.button key={u.uid} whileTap={{ scale: 0.98 }} onClick={() => openDM(u)}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 16px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #185FA5, #2b8dd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#0a0a0a', flexShrink: 0 }}>
                    {u.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{u.name}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{u.email}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: '0.8px', marginBottom: '8px' }}>RECENT CHATS</div>
      {recentChats.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
          <FiUser size={32} style={{ display: 'block', margin: '0 auto 8px', opacity: 0.3 }} />
          No conversations yet. Search for someone to start chatting.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recentChats.map(chat => {
            const otherUid = getOtherParticipant(chat);
            const otherUser = otherUsers[otherUid];
            if (!otherUser) return null;
            return (
              <motion.button key={chat.id} whileTap={{ scale: 0.98 }}
                onClick={() => onOpenChat({ id: chat.id, name: otherUser.name, type: 'dm', otherUserId: otherUid, participants: chat.participants })}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 16px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #185FA5, #2b8dd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#0a0a0a', flexShrink: 0 }}>
                  {otherUser.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{otherUser.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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