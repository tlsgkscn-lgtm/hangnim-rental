"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getSession } from "../../lib/storage";
import { useReceiptNotifications } from "../../hooks/useReceiptNotifications";

type TopNavProps = {
  active?: "apply" | "lookup" | "admin";
};

export default function TopNav({ active = "apply" }: TopNavProps) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setIsAdmin(session.role === "admin");
      setUserName(session.name || "");
    }
  }, []);

  const { toasts, history, unreadCount, dismissToast, dismissHistory, clearHistory, clearUnread } =
    useReceiptNotifications(isAdmin);

  // 토스트 5초 후 자동 제거
  useEffect(() => {
    if (!toasts.length) return;
    const latest = toasts[0];
    const timer = setTimeout(() => dismissToast(latest.id), 5000);
    return () => clearTimeout(timer);
  }, [toasts, dismissToast]);

  // 벨 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  const handleBellClick = () => {
    setBellOpen((v) => !v);
    clearUnread();
  };

  return (
    <>
      <div className="top-nav">
        <div className="logo-wrap">
          <span className="logo-uri">우리집</span>
          <span className="logo-rental">렌탈</span>
          <span className="logo-sub">정수기·생활가전</span>
        </div>

        <div className="nav-tabs">
          <Link
            href="/apply"
            className={`nav-tab ${active === "apply" ? "active" : ""}`}
          >
            📋 렌탈신청
          </Link>
          <Link
            href="/lookup"
            className={`nav-tab ${active === "lookup" ? "active" : ""}`}
          >
            🔍 접수조회
          </Link>
          <Link
            href="/admin"
            className={`nav-tab ${active === "admin" ? "active" : ""}`}
          >
            ⚙️ 관리자
          </Link>
        </div>

        <div className="nav-right">
          {isAdmin && (
            <div className="notif-bell-wrap" ref={bellRef}>
              <button
                className="notif-bell-btn"
                type="button"
                onClick={handleBellClick}
                aria-label="알림"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="notif-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div className="notif-dropdown">
                  <div className="notif-dropdown-header">
                    <span>새 접수 알림</span>
                    {history.length > 0 && (
                      <button
                        className="notif-clear-all"
                        type="button"
                        onClick={clearHistory}
                      >
                        전체 확인
                      </button>
                    )}
                  </div>
                  {history.length === 0 ? (
                    <div className="notif-empty">새 접수 알림이 없습니다</div>
                  ) : (
                    history.map((t) => (
                      <div key={t.id} className="notif-dropdown-item">
                        <div className="notif-item-main">
                          <div className="notif-item-num">{t.receiptNumber}</div>
                          <div className="notif-item-name">{t.customerName}</div>
                          <div className="notif-item-time">
                            {t.createdAt.slice(0, 16).replace("T", " ")}
                          </div>
                        </div>
                        <button
                          className="notif-item-close"
                          type="button"
                          onClick={() => dismissHistory(t.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {isAdmin && <span className="admin-chip">관리자</span>}
          <span className="user-chip">
            {userName ? `${userName} (우리집렌탈)` : "우리집렌탈"}
          </span>
          <button className="logout-btn" type="button" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </div>

      {/* 토스트 알림 */}
      {isAdmin && toasts.length > 0 && (
        <div className="notif-toast-wrap">
          {toasts.map((t) => (
            <div key={t.id} className="notif-toast">
              <div className="notif-toast-title">📋 새 접수가 들어왔습니다</div>
              <div className="notif-toast-body">
                <span className="notif-toast-num">{t.receiptNumber}</span>
                <span className="notif-toast-name">{t.customerName}</span>
              </div>
              <button
                className="notif-toast-close"
                type="button"
                onClick={() => dismissToast(t.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
