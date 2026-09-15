import { useEffect, useState } from 'react';
import {
    getMyNotifications,
    getUnreadCount,
    markNotificationAsRead
} from '../services/notificationService';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);

    const loadNotifications = async () => {
        try {
            const data = await getMyNotifications();
            setNotifications(data);

            const count = await getUnreadCount();
            setUnreadCount(count);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadNotifications();

        const interval = setInterval(loadNotifications, 10000);

        return () => clearInterval(interval);
    }, []);

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.read) {
                await markNotificationAsRead(notification.id);

                setNotifications((prev) =>
                    prev.map((item) =>
                        item.id === notification.id
                            ? { ...item, read: true }
                            : item
                    )
                );

                setUnreadCount((prev) =>
                    Math.max(prev - 1, 0)
                );
            }
        } catch (err) {
            console.error(
                'Failed to mark notification as read:',
                err
            );
        }
    };

    return (
        <div className="relative">

            {/* Notification button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative text-white hover:text-blue-100 text-xl px-2"
                title="Notifications"
            >
                🔔

                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification dropdown */}
            {open && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">

                    <div className="px-4 py-3 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">
                            Notifications
                        </h3>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <p className="text-gray-500 text-sm">
                                No notifications yet.
                            </p>
                        </div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto">

                            {notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    onClick={() =>
                                        handleNotificationClick(
                                            notification
                                        )
                                    }
                                    className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${
                                        !notification.read
                                            ? 'bg-blue-50'
                                            : 'bg-white'
                                    }`}
                                >
                                    <div className="flex gap-3">

                                        <span className="text-lg">
                                            {notification.read
                                                ? '○'
                                                : '●'}
                                        </span>

                                        <div>
                                            <p className="text-sm text-gray-800">
                                                {notification.message}
                                            </p>

                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(
                                                    notification.createdAt
                                                ).toLocaleString()}
                                            </p>
                                        </div>

                                    </div>
                                </button>
                            ))}

                        </div>
                    )}

                </div>
            )}
        </div>
    );
}