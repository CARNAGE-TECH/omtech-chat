import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiSend, FiHash, FiSmile, FiImage, FiFile, FiX } from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';

const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
const TENOR_KEY = process.env.REACT_APP_TENOR_API_KEY;

export default function ChatRoom({ chat, user, onBack, theme, palette, accent }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [gifSearch, setGifSearch] = useState('');
  const [gifs, setGifs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileRef = useRef(null);
  const imageRef = useRef(null);

  const collectionPath = chat.type === 'room' ? `rooms/${chat.id}/messages` : `dms/${chat.id}/messages`;
  const typingPath = chat.type === 'room' ? `rooms/${chat.id}/typing` : `dms/${chat.id}/typing`;

  useEffect(() => {
    const q = query(collection(db, collectionPath), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [collectionPath]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, typingPath), snap => {
      const others = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => t.id !== user.uid && t.typing);
      setTypingUsers(others);
    });
    return () => unsub();
  }, [typingPath, user.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleTyping = (val) => {
    setText(val);
    setDoc(doc(db, typingPath, user.uid), { typing: true, name: user.displayName || 'Someone' });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setDoc(doc(db, typingPath, user.uid), { typing: false, name: user.displayName || 'Someone' });
    }, 1500);
  };

  const sendMessage = async (overrideText, type = 'text', url = null) => {
    const content = overrideText || text.trim();
    if (!content && !url) return;
    setText('');
    setShowEmoji(false);
    setShowGif(false);

    if (chat.type === 'dm') {
      await setDoc(doc(db, 'dms', chat.id), {
        participants: chat.participants,
        lastMessage: type === 'text' ? content : `Sent a ${type}`,
        lastUpdated: serverTimestamp()
      }, { merge: true });
    }

    await addDoc(collection(db, collectionPath), {
      text: content || '',
      type,
      url: url || null,
      senderId: user.uid,
      senderName: user.displayName || user.email,
      createdAt: serverTimestamp()
    });

    setDoc(doc(db, typingPath, user.uid), { typing: false, name: user.displayName || 'Someone' });
  };

  const handleKey = (e) => { if (e.key === 'Enter') sendMessage(); };

  const uploadToCloudinary = async (file, resourceType = 'image') => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) return null;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('cloud_name', CLOUD_NAME);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setUploading(false);
      return data.secure_url;
    } catch {
      setUploading(false);
      return null;
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadToCloudinary(file, 'image');
    if (url) sendMessage('', 'image', url);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadToCloudinary(file, 'raw');
    if (url) sendMessage(file.name, 'file', url);
  };

  const searchGifs = async (q) => {
    setGifSearch(q);
    if (!q.trim()) { setGifs([]); return; }
    if (!TENOR_KEY) { setGifs([]); return; }
    try {
      const res = await fetch(`https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=12&media_filter=gif`);
      const data = await res.json();
      setGifs(data.results || []);
    } catch { setGifs([]); }
  };

  const sendGif = (gif) => {
    const url = gif.media_formats?.gif?.url || gif.url;
    sendMessage('', 'gif', url);
    setShowGif(false);
    setGifs([]);
    setGifSearch('');
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (msg) => {
    if (msg.type === 'image' || msg.type === 'gif') {
      return (
        <img src={msg.url} alt={msg.type} style={{ maxWidth: '220px', borderRadius: '10px', display: 'block', cursor: 'pointer' }}
          onClick={() => window.open(msg.url, '_blank')} />
      );
    }
    if (msg.type === 'file') {
      return (
        <a href={msg.url} target="_blank" rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none', fontSize: '13px' }}>
          <FiFile size={16} /> {msg.text || 'Download file'}
        </a>
      );
    }
    return <span style={{ fontSize: '14px', lineHeight: 1.5, wordBreak: 'break-word' }}>{msg.text}</span>;
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: palette.bg, color: palette.text, fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', borderBottom: `1px solid ${palette.accentBorder}`, background: palette.elevated, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: palette.icon, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <FiArrowLeft size={22} />
        </button>
        <div style={{ width: '40px', height: '40px', borderRadius: chat.type === 'room' ? '10px' : '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {chat.type === 'room' ? <FiHash size={18} color={palette.buttonText} /> : <span style={{ fontSize: '16px', fontWeight: '700', color: palette.buttonText }}>{chat.name[0].toUpperCase()}</span>}
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '700' }}>{chat.name}</div>
          <div style={{ fontSize: '12px', color: palette.muted }}>{chat.type === 'room' ? 'Public room' : 'Direct message'}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: palette.subtle, fontSize: '14px', marginTop: '2rem' }}>
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMine = msg.senderId === user.uid;
            const showName = chat.type === 'room' && !isMine && (i === 0 || messages[i - 1].senderId !== msg.senderId);
            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                {showName && (
                  <div style={{ fontSize: '11px', color: palette.icon, fontWeight: '600', marginBottom: '2px', marginLeft: '4px' }}>{msg.senderName}</div>
                )}
                <div style={{
                  maxWidth: '75%',
                  background: isMine ? accent : palette.otherBubble,
                  color: isMine ? palette.mineText : palette.otherText,
                  borderRadius: '14px',
                  padding: msg.type === 'image' || msg.type === 'gif' ? '4px' : '10px 14px',
                  wordBreak: 'break-word',
                  overflow: 'hidden'
                }}>
                  {renderMessage(msg)}
                </div>
                <div style={{ fontSize: '10px', color: palette.subtle, marginTop: '3px', marginLeft: isMine ? 0 : '4px', marginRight: isMine ? '4px' : 0 }}>
                  {formatTime(msg.createdAt)}
                </div>
              </motion.div>
            );
          })
        )}

        <AnimatePresence>
          {typingUsers.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ fontSize: '12px', color: palette.muted, fontStyle: 'italic', padding: '4px 0' }}>
              {typingUsers.map(t => t.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            style={{ position: 'absolute', bottom: '80px', left: '10px', right: '10px', zIndex: 50 }}>
            <EmojiPicker onEmojiClick={(e) => setText(prev => prev + e.emoji)} theme={theme} width="100%" height={350} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* GIF Picker */}
      <AnimatePresence>
        {showGif && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            style={{ position: 'absolute', bottom: '80px', left: '10px', right: '10px', zIndex: 50, background: palette.surfaceStrong, border: `1px solid ${palette.accentBorder}`, borderRadius: '12px', padding: '1rem', maxHeight: '350px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: palette.shadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: palette.icon }}>Search GIFs</div>
              <button onClick={() => setShowGif(false)} style={{ background: 'none', border: 'none', color: palette.muted, cursor: 'pointer' }}><FiX size={18} /></button>
            </div>
            <input value={gifSearch} onChange={e => searchGifs(e.target.value)}
              placeholder="Search Tenor GIFs..."
              style={{ width: '100%', padding: '10px 14px', background: palette.input, border: `1px solid ${palette.accentBorder}`, borderRadius: '8px', color: palette.text, fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', overflowY: 'auto' }}>
              {gifs.map((gif, i) => (
                <img key={i} src={gif.media_formats?.tinygif?.url || gif.media_formats?.gif?.url} alt="gif"
                  onClick={() => sendGif(gif)}
                  style={{ width: '100%', borderRadius: '8px', cursor: 'pointer', aspectRatio: '1', objectFit: 'cover' }} />
              ))}
            </div>
            {gifs.length === 0 && gifSearch && (
              <div style={{ textAlign: 'center', color: palette.subtle, fontSize: '13px' }}>No GIFs found.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div style={{ padding: '0.75rem 1rem', borderTop: `1px solid ${palette.accentBorder}`, background: palette.elevated }}>
        {uploading && (
          <div style={{ fontSize: '12px', color: palette.icon, marginBottom: '6px', textAlign: 'center' }}>Uploading...</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          {/* Attachment buttons */}
          <button onClick={() => { setShowEmoji(!showEmoji); setShowGif(false); }}
            style={{ background: showEmoji ? (palette.isDark ? 'rgba(24,95,165,0.2)' : '#e8f2fb') : 'none', border: 'none', color: palette.icon, cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
            <FiSmile size={20} />
          </button>

          <button onClick={() => imageRef.current.click()}
            style={{ background: 'none', border: 'none', color: palette.icon, cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
            <FiImage size={20} />
          </button>

          <button onClick={() => fileRef.current.click()}
            style={{ background: 'none', border: 'none', color: palette.icon, cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
            <FiFile size={20} />
          </button>

          <button onClick={() => { setShowGif(!showGif); setShowEmoji(false); }}
            style={{ background: showGif ? (palette.isDark ? 'rgba(24,95,165,0.2)' : '#e8f2fb') : 'none', border: 'none', color: palette.icon, cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', fontSize: '13px', fontWeight: '700', fontFamily: 'inherit' }}>
            GIF
          </button>

          <input value={text} onChange={e => handleTyping(e.target.value)} onKeyDown={handleKey}
            placeholder="Type a message..."
            style={{ flex: 1, padding: '11px 16px', background: palette.input, border: `1px solid ${palette.accentBorder}`, borderRadius: '99px', color: palette.text, fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />

          <button onClick={() => sendMessage()}
            style={{ background: accent, border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <FiSend size={18} color={palette.buttonText} />
          </button>
        </div>

        {/* Hidden file inputs */}
        <input ref={imageRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
        <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
      </div>
    </div>
  );
}
