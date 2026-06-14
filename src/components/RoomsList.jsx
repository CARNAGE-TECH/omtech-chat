import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiHash, FiX, FiSearch, FiCopy, FiCheck } from 'react-icons/fi';

const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export default function RoomsList({ user, onOpenChat }) {
  const [rooms, setRooms] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [joinError, setJoinError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'rooms'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const createRoom = async () => {
    if (!roomName.trim()) return;
    const code = generateRoomCode();
    await addDoc(collection(db, 'rooms'), {
      name: roomName.trim(),
      code,
      createdBy: user.displayName || user.email,
      createdAt: serverTimestamp()
    });
    setRoomName('');
    setShowCreate(false);
  };

  const joinByCode = async () => {
    if (!searchTerm.trim()) return;
    setJoinError('');
    const code = searchTerm.trim().toUpperCase();
    const q = query(collection(db, 'rooms'), where('code', '==', code));
    const snap = await getDocs(q);
    if (snap.empty) { setJoinError('No room found with that code.'); return; }
    const room = snap.docs[0];
    onOpenChat({ id: room.id, name: room.data().name, type: 'room' });
  };

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredRooms = rooms.filter(r =>
    !searchTerm.trim() || r.name.toLowerCase().includes(searchTerm.toLowerCase()) || (r.code && r.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const inputStyle = {
    flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(24,95,165,0.25)', borderRadius: '10px',
    color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
  };

  return (
    <div style={{ padding: '1.5rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.3px' }}>Public Rooms</div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Join the conversation</div>
        </div>
        <button onClick={() => setShowCreate(true)}
          style={{ background: 'linear-gradient(135deg, #185FA5, #2b8dd4)', border: 'none', color: 'white', borderRadius: '10px', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <FiPlus size={20} />
        </button>
      </div>

      {/* Search / Join by code */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative' }}>
          <FiSearch size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setJoinError(''); }} onKeyDown={e => e.key === 'Enter' && joinByCode()}
            placeholder="Search by name or join by room code..."
            style={{ ...inputStyle, paddingLeft: '40px', width: '100%' }} />
        </div>
        {searchTerm.trim() && (
          <button onClick={joinByCode}
            style={{ marginTop: '8px', width: '100%', padding: '10px', background: 'rgba(24,95,165,0.15)', border: '1px solid rgba(24,95,165,0.35)', color: '#90cdf4', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
            Join room by code "{searchTerm.toUpperCase()}"
          </button>
        )}
        {joinError && <div style={{ color: '#fc8181', fontSize: '13px', marginTop: '6px' }}>{joinError}</div>}
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(24,95,165,0.06)', border: '1px solid rgba(24,95,165,0.25)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#90cdf4' }}>Create new room</div>
                <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}><FiX size={18} /></button>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={roomName} onChange={e => setRoomName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createRoom()}
                  placeholder="Room name..." style={inputStyle} />
                <button onClick={createRoom}
                  style={{ background: 'linear-gradient(135deg, #185FA5, #2b8dd4)', border: 'none', color: 'white', borderRadius: '8px', padding: '0 18px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  Create
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredRooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
          No rooms found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredRooms.map(room => (
            <div key={room.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 16px' }}>
              <motion.button whileTap={{ scale: 0.98 }}
                onClick={() => onOpenChat({ id: room.id, name: room.name, type: 'room' })}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', flex: 1, padding: 0 }}>
                <div style={{ background: 'linear-gradient(135deg, #185FA5, #2b8dd4)', borderRadius: '10px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiHash size={18} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: 'white' }}>{room.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Created by {room.createdBy}</div>
                </div>
              </motion.button>
              {room.code && (
                <button onClick={() => copyCode(room.code, room.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(24,95,165,0.12)', border: '1px solid rgba(24,95,165,0.3)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px', color: '#90cdf4', fontFamily: 'inherit', fontWeight: '600', flexShrink: 0 }}>
                  {copiedId === room.id ? <FiCheck size={12} /> : <FiCopy size={12} />}
                  {room.code}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}