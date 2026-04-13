"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "../../components/layout/top-nav";
import {
  formatPhone,
  getReceipts,
  getSession,
  initializeMockData,
  statusBadgeClass,
  type Receipt,
} from "../../lib/storage";

export default function LookupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [results, setResults] = useState<Receipt[] | null>(null);

  useEffect(() => {
    initializeMockData();

    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    setSessionReady(true);
  }, [router]);

  const currentSession = useMemo(() => {
    if (!sessionReady) return null;
    return getSession();
  }, [sessionReady]);

  const doLookup = () => {
    const nm = name.trim();
    const ph = phone.trim().replace(/-/g, "");

    if (!nm && !ph) {
      alert("고객명 또는 휴대폰 번호를 입력해 주세요.");
      return;
    }

    const receipts = getReceipts();

    const filtered = receipts.filter((r) => {
      if (currentSession?.role !== "admin" && r.userId !== currentSession?.id) {
        return false;
      }

      const receiptPhone = (r.phone || "").replace(/-/g, "");
      const nameMatch = nm ? r.name === nm : false;
      const phoneMatch = ph ? receiptPhone === ph : false;

      if (nm && ph) return nameMatch && phoneMatch;
      if (nm) return nameMatch;
      if (ph) return phoneMatch;

      return false;
    });

    setResults(filtered);
  };

  if (!sessionReady) return null;

  return (
    <>
      <TopNav active="lookup" />

      <main className="page active">
        <div className="card">
          <div className="card-header">🔍 접수 내역 조회</div>
          <div className="card-body">
            <div className="alert alert-yellow">
              고객명 또는 휴대폰 번호로 조회할 수 있습니다. (하나만 입력해도 됩니다)
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "flex-end",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text2)",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  고객명
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  style={{ maxWidth: 150 }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text2)",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  휴대폰 번호
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="010-0000-0000"
                  style={{ maxWidth: 160 }}
                  inputMode="numeric"
                />
              </div>

              <button className="btn btn-primary" type="button" onClick={doLookup}>
                조회하기
              </button>
            </div>
          </div>
        </div>

        {results !== null && (
          <div className="card">
            <div className="card-header">조회 결과 ({results.length}건)</div>
            <div className="card-body">
              {results.length === 0 ? (
                <div className="alert alert-info">조회된 접수 내역이 없습니다.</div>
              ) : (
                <div className="tbl-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>접수번호</th>
                        <th>접수일</th>
                        <th>고객명</th>
                        <th>연락처</th>
                        <th>제품</th>
                        <th>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r) => (
                        <tr key={r.num}>
                          <td>
                            <span
                              style={{
                                color: "var(--blue2)",
                                fontWeight: 700,
                                fontSize: 11,
                              }}
                            >
                              {r.num}
                            </span>
                          </td>
                          <td>{r.date}</td>
                          <td>
                            <strong>{r.name}</strong>
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>{r.phone}</td>
                          <td style={{ fontSize: 12 }}>
                            {(r.products || []).slice(0, 2).join(", ")}
                            {(r.products || []).length > 2 ? "…" : ""}
                          </td>
                          <td>
                            <span className={`badge ${statusBadgeClass(r.status)}`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}