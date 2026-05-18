'use client';

import { Bell, Check } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchNotifications, markNotificationsRead } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationBell() {
  const { currentUser, token, notifications, setNotifications, unreadCount } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await fetchNotifications(currentUser.id);
      setNotifications(data);
    } catch {
      // silent
    }
  }, [currentUser, setNotifications]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await markNotificationsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silent
    }
    setLoading(false);
  };

  const typeColors: Record<string, string> = {
    INFO: 'bg-blue-100 text-blue-700',
    APPOINTMENT: 'bg-purple-100 text-purple-700',
    REMINDER: 'bg-amber-100 text-amber-700',
    ACHIEVEMENT: 'bg-green-100 text-green-700',
    URGENT: 'bg-red-100 text-red-700',
  };

  const typeIcons: Record<string, string> = {
    INFO: 'ℹ️',
    APPOINTMENT: '📅',
    REMINDER: '⏰',
    ACHIEVEMENT: '🎉',
    URGENT: '🚨',
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-500 hover:text-red-600 relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllRead}
                    disabled={loading}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
              </div>
              <ScrollArea className="max-h-80 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No notifications yet
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                          !n.isRead ? 'bg-red-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg mt-0.5">{typeIcons[n.type] || '📢'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-medium ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                {n.title}
                              </p>
                              <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${typeColors[n.type] || 'bg-gray-100 text-gray-600'}`}>
                                {n.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(n.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          {!n.isRead && (
                            <div className="h-2 w-2 rounded-full bg-red-500 mt-2 shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
