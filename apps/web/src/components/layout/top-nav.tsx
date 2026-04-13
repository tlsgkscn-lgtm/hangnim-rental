"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession } from "../../lib/storage";

type TopNavProps = {
  active?: "apply" | "lookup" | "admin";
};

export default function TopNav({ active = "apply" }: TopNavProps) {
  const router = useRouter();

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  return (
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
        <span className="admin-chip">관리자</span>
        <span className="user-chip">관리자 (우리집렌탈)</span>
        <button className="logout-btn" type="button" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </div>
  );
}