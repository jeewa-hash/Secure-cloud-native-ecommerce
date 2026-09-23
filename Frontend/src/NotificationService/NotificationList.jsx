// NotificationPage.jsx — Full notification history page

import React, { useState, useEffect } from 'react';
import { Bell, ShoppingBag, RefreshCw, CheckCheck, Clock, Filter, Inbox } from 'lucide-react';
import axios from 'axios';
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
  } catch {
    return null;
  }
};

const TYPE_CONFIG = {
  ORDER_CREATED:        { icon: <ShoppingBag size={16} />, color: '#3b82f6', bg: '#eff6ff', label: 'Order Created' },
  ORDER_STATUS_UPDATED: { icon: <RefreshCw size={16} />,  color: '#e87722', bg: '#fff7ed', label: 'Status Updated' },
  ORDER_CONFIRMED:      { icon: <CheckCheck size={16} />, color: '#22c55e', bg: '#f0fdf4', label: 'Confirmed' },
  DEFAULT:              { icon: <Bell size={16} />,        color: '#8b5cf6', bg: '#f5f3ff', label: 'Notification' },
};

const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.DEFAULT;

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'Just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ── Group notifications by date ──────────────────────────────────────────────
const groupByDate = (notifications) => {
  const groups = {};
  notifications.forEach((n) => {
    const d = new Date(n.createdAt);
    const today     = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);

    let label;
    if (d.toDateString() === today.toDateString())     label = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  return groups;
};

const FILTERS = ['All', 'Unread', 'ORDER_CREATED', 'ORDER_STATUS_UPDATED', 'ORDER_CONFIRMED'];

const NotificationPage = () => {
  const [notifications, setNotifications]   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [activeFilter, setActiveFilter]     = useState('All');
  const [markingRead, setMarkingRead]       = useState(false);

  const currentUser = getUserFromToken();
  const roomId = currentUser?.id || currentUser?._id;

  // ── Fetch all notifications ───────────────────────────────────────────────
  const fetchNotifications = async () => {
    if (!roomId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${NOTIFICATION_SERVICE_URL}/api/notifications/${roomId}`);
      console.log("API RESPONSE:", res.data);
      // Sort newest first
      const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(sorted);
    } catch (err) {
      setError("Failed to load notifications. Please try again.");
      console.error("❌ Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, [roomId]);

  // ── Mark all as read ──────────────────────────────────────────────────────
  const markAllRead = async () => {
    setMarkingRead(true);
    try {
      // Call your API if you have a mark-read endpoint:
      // await axios.patch(`${NOTIFICATION_SERVICE_URL}/api/notifications/${roomId}/mark-read`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("❌ Mark read error:", err.message);
    } finally {
      setMarkingRead(false);
    }
  };

  // ── Mark single as read ───────────────────────────────────────────────────
  const markOneRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    );
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = notifications.filter(n => {
    if (activeFilter === 'All')    return true;
    if (activeFilter === 'Unread') return !n.isRead == false; // Convert to boolean
    return n.type === activeFilter;
  });

  const grouped  = groupByDate(filtered);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .np-page {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #f9f5f1;
          padding: 32px 24px 60px;
        }

        /* ── Header ── */
        .np-header {
          max-width: 780px;
          margin: 0 auto 28px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .np-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .np-icon-wrap {
          width: 48px; height: 48px;
          background: linear-gradient(135deg, #e87722, #c95e10);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 18px rgba(232,119,34,0.3);
        }
        .np-title {
          font-family: 'Sora', sans-serif;
          font-size: 22px; font-weight: 700; color: #1a1a1a;
          margin: 0;
        }
        .np-subtitle { font-size: 13px; color: #9a8070; margin: 2px 0 0; }

        .np-header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

        .np-unread-badge {
          background: #fff4ec; color: #e87722;
          font-size: 12px; font-weight: 700;
          padding: 5px 12px; border-radius: 20px;
          border: 1.5px solid #fde8d2;
          font-family: 'Sora', sans-serif;
        }

        .np-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .np-btn-outline {
          background: white; color: #5a4535;
          border: 1.5px solid #e8e0d8;
        }
        .np-btn-outline:hover { border-color: #e87722; color: #e87722; background: #fff4ec; }
        .np-btn-primary {
          background: linear-gradient(135deg, #e87722, #c95e10);
          color: white;
          box-shadow: 0 4px 12px rgba(232,119,34,0.25);
        }
        .np-btn-primary:hover { opacity: 0.88; }
        .np-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Filter tabs ── */
        .np-filters {
          max-width: 780px; margin: 0 auto 20px;
          display: flex; gap: 8px; flex-wrap: wrap;
          align-items: center;
        }
        .np-filter-label {
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; color: #9a8070; font-weight: 600;
          margin-right: 4px;
        }
        .np-filter-btn {
          padding: 6px 14px; border-radius: 20px; border: 1.5px solid #e8e0d8;
          background: white; font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 600; color: #7a6558;
          cursor: pointer; transition: all 0.18s; white-space: nowrap;
        }
        .np-filter-btn:hover { border-color: #e87722; color: #e87722; }
        .np-filter-btn.active {
          background: #e87722; color: white; border-color: #e87722;
          box-shadow: 0 3px 10px rgba(232,119,34,0.25);
        }

        /* ── Content area ── */
        .np-content { max-width: 780px; margin: 0 auto; }

        /* Date group */
        .np-group { margin-bottom: 28px; }
        .np-group-label {
          font-size: 11px; font-weight: 700; color: #b0a098;
          text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 10px; padding-left: 4px;
          display: flex; align-items: center; gap: 8px;
        }
        .np-group-label::after {
          content: '';
          flex: 1; height: 1px; background: #ede5da;
        }

        /* Notification card */
        .np-card {
          background: white;
          border-radius: 14px;
          border: 1.5px solid #f0ece8;
          margin-bottom: 10px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 18px;
          cursor: pointer;
          transition: box-shadow 0.2s, border-color 0.2s, transform 0.15s;
          position: relative;
          overflow: hidden;
        }
        .np-card:hover {
          box-shadow: 0 8px 28px rgba(0,0,0,0.07);
          border-color: #e8d8cc;
          transform: translateY(-1px);
        }
        .np-card.unread { border-left: 4px solid #e87722; background: #fffaf7; }
        .np-card.unread::before {
          content: '';
          position: absolute; top: 14px; right: 16px;
          width: 8px; height: 8px;
          border-radius: 50%; background: #e87722;
        }

        .np-card-icon {
          width: 42px; height: 42px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .np-card-body { flex: 1; min-width: 0; }
        .np-card-top {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 4px; flex-wrap: wrap;
        }
        .np-card-type {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.6px; padding: 2px 8px; border-radius: 20px;
        }
        .np-card-msg {
          font-size: 14px; color: #2d2018; line-height: 1.5;
          font-weight: 500;
        }
        .np-card-msg.read { color: #7a6558; font-weight: 400; }
        .np-card-meta {
          display: flex; align-items: center; gap: 6px;
          margin-top: 6px; font-size: 11px; color: #b0a098;
        }

        /* States */
        .np-loading {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 80px 0; gap: 14px; color: #b0a098;
        }
        .np-spinner {
          width: 36px; height: 36px; border: 3px solid #f0ece8;
          border-top-color: #e87722; border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .np-empty {
          display: flex; flex-direction: column; align-items: center;
          padding: 80px 0; gap: 14px; color: #b0a098;
          text-align: center;
        }
        .np-empty-icon {
          width: 72px; height: 72px; background: #f5ede6; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .np-empty h3 { font-family: 'Sora', sans-serif; font-size: 16px; color: #4a3728; margin: 0; }
        .np-empty p  { font-size: 13px; margin: 0; }

        .np-error {
          text-align: center; padding: 60px 0;
          font-size: 14px; color: #e87722;
        }

        /* Count summary */
        .np-summary {
          text-align: center; font-size: 12px; color: #b0a098;
          margin-top: 24px; padding-top: 16px;
          border-top: 1px solid #f0ece8;
        }
      `}</style>

      <div className="np-page">

        {/* ── Page Header ── */}
        <div className="np-header">
          <div className="np-title-row">
            <div className="np-icon-wrap">
              <Bell size={22} color="white" />
            </div>
            <div>
              <h1 className="np-title">Notifications</h1>
              <p className="np-subtitle">
                {loading ? 'Loading…' : `${notifications.length} total · ${unreadCount} unread`}
              </p>
            </div>
          </div>

          <div className="np-header-actions">
            {unreadCount > 0 && (
              <span className="np-unread-badge">{unreadCount} unread</span>
            )}
            <button
              className="np-btn np-btn-outline"
              onClick={fetchNotifications}
              disabled={loading}
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
              Refresh
            </button>
            {unreadCount > 0 && (
              <button
                className="np-btn np-btn-primary"
                onClick={markAllRead}
                disabled={markingRead}
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="np-filters">
          <span className="np-filter-label"><Filter size={12} /> Filter</span>
          {FILTERS.map(f => (
            <button
              key={f}
              className={`np-filter-btn ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f === 'All'    ? `All (${notifications.length})` :
               f === 'Unread' ? `Unread (${unreadCount})` :
               getTypeConfig(f).label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="np-content">

          {/* Loading */}
          {loading && (
            <div className="np-loading">
              <div className="np-spinner" />
              <span>Fetching your notifications…</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="np-error">
              ⚠️ {error}
              <br />
              <button className="np-btn np-btn-outline" style={{ margin: '16px auto 0', display: 'flex' }} onClick={fetchNotifications}>
                Try again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="np-empty">
              <div className="np-empty-icon">
                <Inbox size={30} color="#c9a98a" />
              </div>
              <h3>No notifications yet</h3>
              <p>
                {activeFilter !== 'All'
                  ? `No "${activeFilter === 'Unread' ? 'unread' : getTypeConfig(activeFilter).label}" notifications found.`
                  : "You're all caught up! New notifications will appear here."}
              </p>
              {activeFilter !== 'All' && (
                <button className="np-btn np-btn-outline" onClick={() => setActiveFilter('All')} style={{ marginTop: 8 }}>
                  View all
                </button>
              )}
            </div>
          )}

          {/* Grouped Notification Cards */}
          {!loading && !error && Object.entries(grouped).map(([dateLabel, items]) => (
            <div key={dateLabel} className="np-group">
              <div className="np-group-label">{dateLabel}</div>

              {items.map((n, i) => {
                const cfg = getTypeConfig(n.type);
                return (
                  <div
                    key={n._id || i}
                    className={`np-card ${!n.isRead ? 'unread' : ''}`}
                    onClick={() => markOneRead(n._id)}
                  >
                    {/* Icon */}
                    <div className="np-card-icon" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.icon}
                    </div>

                    {/* Body */}
                    <div className="np-card-body">
                      <div className="np-card-top">
                        <span
                          className="np-card-type"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                        {!n.isRead && (
                          <span style={{ fontSize: 10, color: '#e87722', fontWeight: 700 }}>NEW</span>
                        )}
                      </div>

                      <div className={`np-card-msg ${n.isRead ? 'read' : ''}`}>
                        {n.message}
                      </div>

                      <div className="np-card-meta">
                        <Clock size={10} />
                        {timeAgo(n.createdAt)}
                        <span style={{ color: '#ddd' }}>·</span>
                        {new Date(n.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        {n.relatedId && (
                          <>
                            <span style={{ color: '#ddd' }}>·</span>
                            <span>Order #{n.relatedId.slice(-6).toUpperCase()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Summary */}
          {!loading && filtered.length > 0 && (
            <div className="np-summary">
              Showing {filtered.length} of {notifications.length} notifications
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default NotificationPage;