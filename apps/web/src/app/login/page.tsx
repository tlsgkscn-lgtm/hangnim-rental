"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, initializeMockData, setSession } from "../../lib/storage";
import { apiFetch } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    initializeMockData();

    const session = getSession();
    if (session) {
      router.replace("/apply");
    }
  }, [router]);

const handleLogin = async () => {
  setError('');

  if (!id.trim() || !pw.trim()) {
    setError('아이디와 비밀번호를 입력해 주세요.');
    return;
  }

  try {
    const result = await apiFetch<{
      accessToken?: string;
      user: {
        id: string;
        loginId: string;
        name: string;
        role: 'ADMIN' | 'USER' | 'admin' | 'user';
        status?: string;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        loginId: id.trim(),
        password: pw,
      }),
    });

    const normalizedRole =
      result.user.role === 'ADMIN' || result.user.role === 'admin'
        ? 'admin'
        : 'user';

    setSession({
      id: result.user.id,
      name: result.user.name,
      role: normalizedRole,
    });

    if (result.accessToken) {
      localStorage.setItem('wj_access_token', result.accessToken);
    }

    router.push('/apply');
  } catch (err) {
    setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
  }
};

  return (
    <main className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <div>
            <span className="l-uri">우리집</span>
            <span className="l-rental">렌탈</span>
          </div>
          <div className="l-sub">정수기·생활가전 접수시스템</div>
        </div>

        <h2>로그인</h2>

        {error && <div className="login-err">{error}</div>}

        <div className="login-field">
          <label>아이디</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="아이디 입력"
            autoComplete="username"
          />
        </div>

        <div className="login-field">
          <label>비밀번호</label>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="비밀번호 입력"
            autoComplete="current-password"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
          />
        </div>

        <button className="login-btn" type="button" onClick={handleLogin}>
          로그인
        </button>

        <div className="login-pending">
          테스트 계정: admin / admin1234
          <br />
          관리자 문의: 계정 승인 후 이용 가능합니다
        </div>
      </div>
    </main>
  );
}