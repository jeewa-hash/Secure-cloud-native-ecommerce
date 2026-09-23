// Header.jsx — with "View all notifications" link

import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Bell, User, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import { NOTIFICATION_SERVICE_URL } from '../apiConfig.js';
//const NOTIFICATION_SERVICE_URL = "http://localhost:5000";

const getUserFromToken = () => {
  try {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('token');
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded.user || decoded;
  } catch (err) {
    console.error("❌ Token decode failed:", err.message);
    return null;
  }
};

const Header = () => {
  const [currentUser]   = useState(() => getUserFromToken()); // ✅ lazy init — survives refresh
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const dropdownRef = useRef(null);
  const socketRef   = useRef(null);
  const navigate    = useNavigate();

  const roomId   = currentUser?.id || currentUser?._id;
  const userRole = currentUser?.role;

  // Fetch latest 5 for dropdown preview
  useEffect(() => {
    if (!roomId) return;
    axios.get(`${NOTIFICATION_SERVICE_URL}/api/notifications/${roomId}`)
      .then(res => {
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(sorted.slice(0, 5)); // only show 5 in dropdown
        setUnreadCount(res.data.filter(n => !n.isRead).length);
      })
      .catch(err => console.error("❌ Fetch notifications failed:", err.message));
  }, [roomId]);

  // Socket.io real-time listener
  useEffect(() => {
    if (!roomId) return;

    const socket = io(NOTIFICATION_SERVICE_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', roomId);
      console.log("📡 Joined room:", roomId);
    });

    socket.on('notification', (newNotif) => {
      setNotifications(prev => [newNotif, ...prev].slice(0, 5));
      setUnreadCount(prev => prev + 1);

      toast.custom((t) => (
        <div style={{
          background: 'white', width: 340, borderRadius: 14,
          borderLeft: '4px solid #e87722', padding: '14px 16px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.13)',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', gap: 12,
          opacity: t.visible ? 1 : 0, transition: 'opacity 0.3s',
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#e87722', marginBottom: 4 }}>
              🔔 {newNotif.type?.replace(/_/g, ' ')}
            </div>
            <div style={{ fontSize: 13, color: '#333', lineHeight: 1.4 }}>{newNotif.message}</div>
          </div>
          <button onClick={() => toast.dismiss(t.id)}
            style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 20, lineHeight: 1, flexShrink: 0 }}>
            ×
          </button>
        </div>
      ), { duration: 5000, position: 'top-right' });
    });

    return () => socket.disconnect();
  }, [roomId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');
        .ecom-header { font-family:'DM Sans',sans-serif; background:#fff; border-bottom:1px solid #f0ece8; position:sticky; top:0; z-index:100; }
        .ecom-topbar { background:linear-gradient(90deg,#1a1a1a,#2d1a0e); padding:7px 32px; display:flex; justify-content:space-between; align-items:center; }
        .ecom-topbar-left { color:#d1c4b8; font-size:12px; display:flex; align-items:center; gap:6px; }
        .ecom-topbar-right { color:#d1c4b8; font-size:12px; display:flex; gap:12px; align-items:center; }
        .ecom-topbar-right span { cursor:pointer; transition:color .2s; }
        .ecom-topbar-right span:hover { color:#e87722; }
        .ecom-main { padding:0 32px; height:72px; display:flex; align-items:center; gap:16px; }
        .ecom-logo { display:flex; align-items:center; gap:10px; text-decoration:none; }
        .ecom-logo-icon { width:38px; height:38px; background:linear-gradient(135deg,#e87722,#c95e10); border-radius:10px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(232,119,34,.3); }
        .ecom-logo-text { font-family:'Sora',sans-serif; font-size:20px; font-weight:700; color:#1a1a1a; }
        .ecom-logo-text span { color:#e87722; }
        .ecom-actions { margin-left:auto; display:flex; align-items:center; gap:8px; }
        .ecom-icon-btn { width:42px; height:42px; border-radius:12px; border:none; background:transparent; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#5a4535; position:relative; transition:all .2s; }
        .ecom-icon-btn:hover { background:#fff4ec; color:#e87722; }
        .ecom-badge { position:absolute; top:5px; right:5px; min-width:18px; height:18px; background:#e87722; color:#fff; font-size:10px; font-weight:700; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; padding:0 3px; font-family:'Sora',sans-serif; }
        .notif-dropdown { position:absolute; top:52px; right:0; width:360px; background:#fff; border-radius:16px; box-shadow:0 20px 60px rgba(0,0,0,.14); border:1px solid #f0ece8; overflow:hidden; z-index:200; animation:dropIn .18s ease; }
        @keyframes dropIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .notif-header { padding:14px 18px; border-bottom:1px solid #f5f0ea; display:flex; justify-content:space-between; align-items:center; }
        .notif-title { font-weight:700; font-size:14px; color:#1a1a1a; font-family:'Sora',sans-serif; }
        .notif-mark-btn { font-size:11px; color:#e87722; font-weight:600; background:none; border:none; cursor:pointer; padding:4px 8px; border-radius:6px; transition:background .2s; }
        .notif-mark-btn:hover { background:#fff4ec; }
        .notif-list { max-height:320px; overflow-y:auto; }
        .notif-list::-webkit-scrollbar { width:4px; }
        .notif-list::-webkit-scrollbar-thumb { background:#f0ece8; border-radius:4px; }
        .notif-item { padding:13px 18px; border-bottom:1px solid #fafafa; transition:background .15s; cursor:pointer; }
        .notif-item:hover { background:#fffaf7; }
        .notif-item.unread { background:#fff8f3; border-left:3px solid #e87722; }
        .notif-type { font-size:10px; font-weight:700; color:#e87722; text-transform:uppercase; letter-spacing:.6px; }
        .notif-msg { font-size:13px; color:#444; margin-top:3px; line-height:1.45; }
        .notif-time { font-size:10px; color:#bbb; margin-top:5px; }
        .notif-empty { padding:36px; text-align:center; color:#ccc; font-size:13px; }
        .notif-footer { padding:12px 18px; border-top:1px solid #f5f0ea; background:#fdfaf8; }
        .notif-view-all { display:flex; align-items:center; justify-content:center; gap:6px; width:100%; padding:9px; border-radius:10px; border:1.5px solid #e8e0d8; background:white; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; color:#4a3728; cursor:pointer; transition:all .2s; }
        .notif-view-all:hover { border-color:#e87722; color:#e87722; background:#fff4ec; }
        .ecom-user-pill { display:flex; align-items:center; gap:8px; padding:6px 14px; border-radius:40px; border:1.5px solid #e8e0d8; background:#faf8f6; cursor:pointer; transition:border-color .2s; }
        .ecom-user-pill:hover { border-color:#e87722; }
        .ecom-role-badge { font-size:9px; font-weight:700; background:#fff4ec; color:#e87722; padding:2px 6px; border-radius:10px; text-transform:uppercase; letter-spacing:.4px; }
      `}</style>

      <header className="ecom-header">
        <div className="ecom-topbar">
          <div className="ecom-topbar-left">
            <MapPin size={12} />
            Deliver to: <strong style={{ color: '#e8c9a8', marginLeft: 4 }}>Colombo, LK</strong>
          </div>
          <div className="ecom-topbar-right">
            <span>Track Order</span><span>|</span><span>Help</span>
          </div>
        </div>

        <div className="ecom-main">
          <a className="ecom-logo" href="/">
            <div className="ecom-logo-icon"><ShoppingCart size={18} color="white" /></div>
            <span className="ecom-logo-text">E<span>Com</span></span>
          </a>

          <div className="ecom-actions" ref={dropdownRef}>
            <div style={{ position: 'relative' }}>
              <button className="ecom-icon-btn" onClick={() => setDropdownOpen(o => !o)} title="Notifications">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="ecom-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </button>

              {dropdownOpen && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span className="notif-title">Notifications</span>
                    {unreadCount > 0 && (
                      <button className="notif-mark-btn" onClick={markAllRead}>Mark all read</button>
                    )}
                  </div>

                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">🔔 No notifications yet</div>
                    ) : (
                      notifications.map((n, i) => (
                        <div key={n._id || i} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                          <div className="notif-type">{n.type?.replace(/_/g, ' ')}</div>
                          <div className="notif-msg">{n.message}</div>
                          <div className="notif-time">{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* ✅ View all → full NotificationPage */}
                  <div className="notif-footer">
                    <button
                      className="notif-view-all"
                      onClick={() => { setDropdownOpen(false); navigate('/notifications'); }}
                    >
                      View all notifications <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="ecom-user-pill">
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#e87722,#c95e10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={14} color="white" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>
                {currentUser ? userRole || 'User' : 'Account'}
              </span>
              {userRole && <span className="ecom-role-badge">{userRole}</span>}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;