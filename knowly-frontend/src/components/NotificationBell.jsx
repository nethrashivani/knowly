import { useEffect, useRef, useState } from 'react';
import {
    getMyNotifications,
    getUnreadCount,
    markNotificationAsRead
} from '../services/notificationService';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [markingId, setMarkingId] = useState(null);
    const dropdownRef = useRef(null);

    const loadNotifications = async () => {
        try {
            const [notificationsData, count] = await Promise.all([
                getMyNotifications(),
                getUnreadCount()
            ]);
            setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
            setUnreadCount(Number(count) || 0);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        }
    };

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBellClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setOpen((prev) => !prev);
    };

    const handleMarkAsRead = async (notificationId) => {
        if (markingId !== null) return;

        setMarkingId(notificationId);
        setNotifications((prev) => prev.map((item) =>
            item.id === notificationId ? { ...item, read: true } : item
        ));
        setUnreadCount((prev) => Math.max(prev - 1, 0));

        try {
            await markNotificationAsRead(notificationId);
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
            await loadNotifications();
        } finally {
            setMarkingId(null);
        }
    };

    const handleMarkAllAsRead = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const unread = notifications.filter((notification) => !notification.read);
        if (unread.length === 0 || markingId !== null) return;

        setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
        setUnreadCount(0);

        try {
            await Promise.all(unread.map((notification) => markNotificationAsRead(notification.id)));
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err);
            await loadNotifications();
        }
    };

    return (
        <div className="relative" ref={dropdownRef} onClick={(event) => event.stopPropagation()}>
            <button
                type="button"
                onClick={handleBellClick}
                className="relative text-gray-600 hover:text-blue-600 text-xl px-2 transition"
                title="Notifications"
                aria-label="Notifications"
                aria-expanded={open}
                aria-haspopup="true"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-gray-200 z-[100] overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
                        <h3 className="font-bold text-gray-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllAsRead}
                                className="text-xs font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <p className="text-gray-500 text-sm">No notifications yet.</p>
                        </div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-4 py-3 border-b border-gray-100 transition ${!notification.read ? 'bg-blue-50' : 'bg-white'}`}
                                >
                                    <div className="flex gap-3 items-start">
                                        <span className={`text-sm mt-1 ${notification.read ? 'text-gray-400' : 'text-blue-600'}`}>
                                            {notification.read ? '○' : '●'}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-gray-800 break-words">{notification.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(notification.createdAt).toLocaleString('en-IN')}
                                            </p>
                                            {!notification.read && (
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleMarkAsRead(notification.id);
                                                    }}
                                                    disabled={markingId === notification.id}
                                                    className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                                >
                                                    {markingId === notification.id ? 'Marking...' : 'Mark as read'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
