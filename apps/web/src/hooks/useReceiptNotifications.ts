"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type NotificationItem = {
  id: string;
  receiptNumber: string;
  customerName: string;
  createdAt: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export function useReceiptNotifications(enabled: boolean) {
  const [toasts, setToasts] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("wj_access_token")
        : null;
    if (!token) return;

    esRef.current?.close();

    const es = new EventSource(
      `${API_BASE_URL}/notifications/receipts?token=${encodeURIComponent(token)}`,
    );
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as Omit<NotificationItem, "id">;
        const item: NotificationItem = { id: `${Date.now()}`, ...data };
        setToasts((prev) => [item, ...prev].slice(0, 5));
        setUnreadCount((c) => c + 1);
      } catch {}
    };

    es.onerror = () => {
      es.close();
      retryRef.current = setTimeout(connect, 5000);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    connect();
    return () => {
      esRef.current?.close();
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [enabled, connect]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearUnread = useCallback(() => setUnreadCount(0), []);

  return { toasts, unreadCount, dismissToast, clearUnread };
}
