"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "../../components/layout/top-nav";
import {
  getReceipts,
  getSession,
  getUsers,
  setUsers,
  setReceipts,
  initializeMockData,
  statusBadgeClass,
  type Receipt,
  type AppUser,
} from "../../lib/storage";

type AdminTab = "list" | "users" | "chart" | "products";

const PER_PAGE = 8;
const STATUS_OPTIONS = ["접수", "상담중", "계약완료", "설치완료", "취소"] as const;

type BrandSetting = {
  id: string;
  name: string;
  color: string;
};

const DEFAULT_BRANDS: BrandSetting[] = [
  { id: "coway", name: "코웨이", color: "#0066CC" },
  { id: "skmagic", name: "SK매직", color: "#E8242A" },
  { id: "chungho", name: "청호나이스", color: "#003087" },
  { id: "lg", name: "LG전자", color: "#A50034" },
  { id: "cuckoo", name: "쿠쿠", color: "#C8001A" },
  { id: "kyowon", name: "교원웰스", color: "#007A45" },
  { id: "hyundai", name: "현대렌탈케어", color: "#002C5F" },
  { id: "cesco", name: "세스코", color: "#D94F00" },
  { id: "etc", name: "기타브랜드 입력", color: "#6B7280" },
];

const DEFAULT_SUBCATS = ["정수기", "공기청정기", "비데", "기타 상품"];

function getBrandsFromStorage(): BrandSetting[] {
  if (typeof window === "undefined") return DEFAULT_BRANDS;
  try {
    const raw = localStorage.getItem("wj_brands");
    return raw ? JSON.parse(raw) : DEFAULT_BRANDS;
  } catch {
    return DEFAULT_BRANDS;
  }
}

function setBrandsToStorage(brands: BrandSetting[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("wj_brands", JSON.stringify(brands));
}

function getSubcatsFromStorage(): string[] {
  if (typeof window === "undefined") return DEFAULT_SUBCATS;
  try {
    const raw = localStorage.getItem("wj_subcats");
    return raw ? JSON.parse(raw) : DEFAULT_SUBCATS;
  } catch {
    return DEFAULT_SUBCATS;
  }
}

function setSubcatsToStorage(subcats: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("wj_subcats", JSON.stringify(subcats));
}

export default function AdminPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<AdminTab>("list");

  const [allReceipts, setAllReceipts] = useState<Receipt[]>([]);
  const [allUsers, setAllUsersState] = useState<AppUser[]>([]);

  const [brands, setBrands] = useState<BrandSetting[]>([]);
  const [subcats, setSubcats] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("접수");

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [umId, setUmId] = useState("");
  const [umPw, setUmPw] = useState("");
  const [umName, setUmName] = useState("");
  const [umCompany, setUmCompany] = useState("");
  const [umPhone, setUmPhone] = useState("");
  const [umRole, setUmRole] = useState<"admin" | "user">("user");
  const [umStatus, setUmStatus] = useState<"active" | "pending" | "blocked">("active");
  const [umMemo, setUmMemo] = useState("");

  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandColor, setNewBrandColor] = useState("#2563EB");
  const [newSubcat, setNewSubcat] = useState("");

  useEffect(() => {
    initializeMockData();

    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    setAllReceipts(getReceipts());
    setAllUsersState(getUsers());
    setBrands(getBrandsFromStorage());
    setSubcats(getSubcatsFromStorage());
    setReady(true);
  }, [router]);

  const currentSession = useMemo(() => {
    if (!ready) return null;
    return getSession();
  }, [ready]);

  const isAdmin = currentSession?.role === "admin";

  const stats = useMemo(() => {
    const total = allReceipts.length;
    const today = new Date().toISOString().slice(0, 10);
    const todayCnt = allReceipts.filter((r) => r.date === today).length;
    const contractCnt = allReceipts.filter(
      (r) => r.status === "계약완료" || r.status === "설치완료"
    ).length;
    const cancelCnt = allReceipts.filter((r) => r.status === "취소").length;
    const pendingCnt = allUsers.filter((u) => u.status === "pending").length;
    const activeCnt = allUsers.filter((u) => u.status === "active").length;

    return { total, todayCnt, contractCnt, cancelCnt, pendingCnt, activeCnt };
  }, [allReceipts, allUsers]);

  const visibleReceipts = useMemo(() => {
    let data = [...allReceipts];

    if (!isAdmin) {
      data = data.filter((r) => r.userId === currentSession?.id);
      return data;
    }

    const q = search.trim().toLowerCase();

    if (q) {
      data = data.filter((r) => r.name.toLowerCase().includes(q));
    }

    if (statusFilter) {
      data = data.filter((r) => r.status === statusFilter);
    }

    if (userFilter) {
      data = data.filter((r) => r.userId === userFilter);
    }

    return data;
  }, [allReceipts, isAdmin, currentSession, search, statusFilter, userFilter]);

  const totalPages = Math.max(1, Math.ceil(visibleReceipts.length / PER_PAGE));

  const pagedReceipts = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE;
    return visibleReceipts.slice(start, start + PER_PAGE);
  }, [visibleReceipts, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();

    return allUsers.filter((u) => {
      if (userStatusFilter && u.status !== userStatusFilter) return false;
      if (q) {
        const a = u.name.toLowerCase().includes(q);
        const b = u.id.toLowerCase().includes(q);
        if (!a && !b) return false;
      }
      return true;
    });
  }, [allUsers, userSearch, userStatusFilter]);

  const pendingUsers = useMemo(
    () => allUsers.filter((u) => u.status === "pending"),
    [allUsers]
  );

  const brandCounts = useMemo(() => {
    const map = new Map<string, number>();

    allReceipts.forEach((r) => {
      if (r.productDetails?.length) {
        r.productDetails.forEach((p: any) => {
          const key = p.brand || "기타";
          map.set(key, (map.get(key) || 0) + 1);
        });
      } else {
        (r.products || []).forEach((p) => {
          const key = p.split(" ")[0] || "기타";
          map.set(key, (map.get(key) || 0) + 1);
        });
      }
    });

    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [allReceipts]);

  const statusCounts = useMemo(() => {
    return STATUS_OPTIONS.map((s) => ({
      label: s,
      value: allReceipts.filter((r) => r.status === s).length,
    }));
  }, [allReceipts]);

  const monthlyCounts = useMemo(() => {
    const now = new Date();
    const months: { label: string; key: string; value: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({
        key,
        label: `${d.getMonth() + 1}월`,
        value: allReceipts.filter((r) => r.date?.startsWith(key)).length,
      });
    }

    return months;
  }, [allReceipts]);

  const openDetailModal = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setSelectedStatus(receipt.status);
    setDetailOpen(true);
  };

  const closeDetailModal = () => {
    setDetailOpen(false);
    setSelectedReceipt(null);
  };

  const updateStatus = () => {
    if (!selectedReceipt) return;

    const next = allReceipts.map((r) =>
      r.num === selectedReceipt.num
        ? { ...r, status: selectedStatus as Receipt["status"] }
        : r
    );

    setReceipts(next);
    setAllReceipts(next);
    closeDetailModal();
  };

  const openNewUserModal = () => {
    setEditingUserId(null);
    setUmId("");
    setUmPw("");
    setUmName("");
    setUmCompany("");
    setUmPhone("");
    setUmRole("user");
    setUmStatus("active");
    setUmMemo("");
    setUserModalOpen(true);
  };

  const openEditUserModal = (user: AppUser) => {
    setEditingUserId(user.id);
    setUmId(user.id);
    setUmPw(user.pw);
    setUmName(user.name);
    setUmCompany(user.company || "");
    setUmPhone(user.phone || "");
    setUmRole(user.role);
    setUmStatus(user.status);
    setUmMemo(user.memo || "");
    setUserModalOpen(true);
  };

  const closeUserModal = () => {
    setUserModalOpen(false);
    setEditingUserId(null);
  };

  const saveUser = () => {
    if (!umId.trim() || !umPw.trim() || !umName.trim()) {
      alert("아이디, 비밀번호, 이름은 필수 입력 항목입니다.");
      return;
    }

    const next = [...allUsers];

    if (editingUserId) {
      const idx = next.findIndex((u) => u.id === editingUserId);
      if (idx < 0) return;

      next[idx] = {
        ...next[idx],
        pw: umPw.trim(),
        name: umName.trim(),
        company: umCompany.trim(),
        phone: umPhone.trim(),
        role: umRole,
        status: umStatus,
        memo: umMemo.trim(),
      };
    } else {
      if (next.some((u) => u.id === umId.trim())) {
        alert("이미 사용 중인 아이디입니다.");
        return;
      }

      next.push({
        id: umId.trim(),
        pw: umPw.trim(),
        name: umName.trim(),
        company: umCompany.trim(),
        phone: umPhone.trim(),
        role: umRole,
        status: umStatus,
        memo: umMemo.trim(),
        createdAt: new Date().toISOString().slice(0, 10),
      });
    }

    setUsers(next);
    setAllUsersState(next);
    closeUserModal();
    alert("저장되었습니다.");
  };

  const quickApprove = (id: string) => {
    const next = allUsers.map((u) =>
      u.id === id ? { ...u, status: "active" as const } : u
    );
    setUsers(next);
    setAllUsersState(next);
    alert("계정이 활성화되었습니다.");
  };

  const quickBlock = (id: string) => {
    const target = allUsers.find((u) => u.id === id);
    if (!target) return;

    if (!confirm(`${target.name}(${target.id}) 계정을 차단하시겠습니까?`)) return;

    const next = allUsers.map((u) =>
      u.id === id ? { ...u, status: "blocked" as const } : u
    );

    setUsers(next);
    setAllUsersState(next);
  };

  const deleteUser = (id: string) => {
    const target = allUsers.find((u) => u.id === id);
    if (!target) return;

    const adminCount = allUsers.filter((u) => u.role === "admin").length;
    if (target.role === "admin" && adminCount <= 1) {
      alert("관리자 계정은 최소 1개 이상 있어야 합니다.");
      return;
    }

    if (!confirm(`[${target.name}] 계정을 정말 삭제하시겠습니까?`)) return;

    const next = allUsers.filter((u) => u.id !== id);
    setUsers(next);
    setAllUsersState(next);
  };

  const saveBrandName = (index: number, value: string) => {
    const next = [...brands];
    next[index] = { ...next[index], name: value };
    setBrands(next);
  };

  const saveBrandColor = (index: number, value: string) => {
    const next = [...brands];
    next[index] = { ...next[index], color: value };
    setBrands(next);
  };

  const persistBrands = () => {
    setBrandsToStorage(brands);
    alert("브랜드 설정이 저장되었습니다.");
  };

  const addBrand = () => {
    if (!newBrandName.trim()) {
      alert("브랜드명을 입력해 주세요.");
      return;
    }

    const next = [...brands];
    const etcIndex = next.findIndex((b) => b.id === "etc");
    const newBrand: BrandSetting = {
      id: `brand_${Date.now()}`,
      name: newBrandName.trim(),
      color: newBrandColor,
    };

    if (etcIndex >= 0) {
      next.splice(etcIndex, 0, newBrand);
    } else {
      next.push(newBrand);
    }

    setBrands(next);
    setNewBrandName("");
    setNewBrandColor("#2563EB");
  };

  const deleteBrand = (index: number) => {
    if (brands[index]?.id === "etc") {
      alert("기타 브랜드는 삭제할 수 없습니다.");
      return;
    }

    if (!confirm(`[${brands[index]?.name}] 브랜드를 삭제하시겠습니까?`)) return;

    const next = brands.filter((_, i) => i !== index);
    setBrands(next);
  };

  const updateSubcat = (index: number, value: string) => {
    const next = [...subcats];
    next[index] = value;
    setSubcats(next);
  };

  const removeSubcat = (index: number) => {
    if (subcats.length <= 1) {
      alert("품목은 최소 1개 이상 유지해야 합니다.");
      return;
    }

    const next = subcats.filter((_, i) => i !== index);
    setSubcats(next);
  };

  const addSubcat = () => {
    if (!newSubcat.trim()) {
      alert("품목명을 입력해 주세요.");
      return;
    }

    if (subcats.includes(newSubcat.trim())) {
      alert("이미 존재하는 품목입니다.");
      return;
    }

    setSubcats([...subcats, newSubcat.trim()]);
    setNewSubcat("");
  };

  const persistSubcats = () => {
    const cleaned = subcats.map((s) => s.trim()).filter(Boolean);
    if (!cleaned.length) {
      alert("품목은 최소 1개 이상 필요합니다.");
      return;
    }
    setSubcats(cleaned);
    setSubcatsToStorage(cleaned);
    alert("품목 목록이 저장되었습니다.");
  };

  if (!ready) return null;

  return (
    <>
      <TopNav active="admin" />

      <main className="page">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="num">{stats.total}</div>
            <div className="lbl">총 접수</div>
          </div>
          <div className="stat-card">
            <div className="num" style={{ color: "var(--green)" }}>
              {stats.todayCnt}
            </div>
            <div className="lbl">오늘 접수</div>
          </div>
          <div className="stat-card">
            <div className="num" style={{ color: "var(--green)" }}>
              {stats.contractCnt}
            </div>
            <div className="lbl">계약완료</div>
          </div>
          <div className="stat-card">
            <div className="num" style={{ color: "var(--red)" }}>
              {stats.cancelCnt}
            </div>
            <div className="lbl">취소</div>
          </div>
          <div className="stat-card">
            <div className="num" style={{ color: "var(--orange)" }}>
              {stats.pendingCnt}
            </div>
            <div className="lbl">승인 대기</div>
          </div>
          <div className="stat-card">
            <div className="num" style={{ color: "var(--purple)" }}>
              {stats.activeCnt}
            </div>
            <div className="lbl">활성 계정</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 14, borderBottom: "2px solid var(--gray-border)", flexWrap: "wrap" }}>
          {isAdmin ? (
            <>
              <button className={`btn btn-sm ${tab === "list" ? "btn-outline" : "btn-gray"}`} onClick={() => setTab("list")}>
                📋 접수 목록
              </button>
              <button className={`btn btn-sm ${tab === "users" ? "btn-outline" : "btn-gray"}`} onClick={() => setTab("users")}>
                👥 사용자 관리
              </button>
              <button className={`btn btn-sm ${tab === "chart" ? "btn-outline" : "btn-gray"}`} onClick={() => setTab("chart")}>
                📊 현황 분석
              </button>
              <button className={`btn btn-sm ${tab === "products" ? "btn-outline" : "btn-gray"}`} onClick={() => setTab("products")}>
                📦 제품 설정
              </button>
            </>
          ) : (
            <button className="btn btn-sm btn-outline">📑 내 접수목록</button>
          )}
        </div>

        {(tab === "list" || !isAdmin) && (
          <div className="card">
            <div className="card-header">
              {isAdmin ? "📋 렌탈 접수 목록" : "📑 내 접수목록"}
              <span style={{ fontSize: 12, fontWeight: 400, marginLeft: "auto" }}>
                {isAdmin ? `총 ${visibleReceipts.length}건` : `내 접수 ${visibleReceipts.length}건`}
              </span>
            </div>
            <div className="card-body">
              {isAdmin && (
                <div className="search-bar">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="고객명 검색"
                    style={{ maxWidth: 170 }}
                  />

                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ maxWidth: 120 }}
                  >
                    <option value="">전체 상태</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>

                  <select
                    value={userFilter}
                    onChange={(e) => {
                      setUserFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ maxWidth: 130 }}
                  >
                    <option value="">전체 접수자</option>
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.id})
                      </option>
                    ))}
                  </select>

                  <button className="btn btn-success btn-sm" type="button">
                    📥 CSV 내보내기
                  </button>
                </div>
              )}

              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>접수일</th>
                      <th>고객명</th>
                      <th>연락처</th>
                      <th>제품</th>
                      <th>상태</th>
                      <th>담당자</th>
                      <th>접수번호</th>
                      <th>접수자</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedReceipts.length > 0 ? (
                      pagedReceipts.map((r) => (
                        <tr key={r.num}>
                          <td>{r.date}</td>
                          <td><strong>{r.name}</strong></td>
                          <td style={{ whiteSpace: "nowrap" }}>{r.phone}</td>
                          <td style={{ maxWidth: 180, fontSize: 12 }}>
                            {(r.products || []).slice(0, 2).join(", ")}
                            {(r.products || []).length > 2 ? "…" : ""}
                          </td>
                          <td>
                            <span className={`badge ${statusBadgeClass(r.status)}`}>{r.status}</span>
                          </td>
                          <td>{r.agent}</td>
                          <td>
                            <span style={{ color: "var(--blue2)", fontSize: 11, fontWeight: 700 }}>
                              {r.num}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: 12, color: "var(--text2)" }}>
                              {r.userName || r.userId || "-"}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-outline btn-sm" type="button" onClick={() => openDetailModal(r)}>
                              상세
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} style={{ color: "var(--gray)", padding: 20 }}>
                          데이터가 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {isAdmin && totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`btn btn-sm ${p === currentPage ? "btn-primary" : "btn-gray"}`}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "users" && isAdmin && (
          <>
            <div className="card">
              <div className="card-header purple">👥 사용자(거래처) 계정 관리</div>
              <div className="card-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="이름/아이디 검색"
                      style={{ maxWidth: 180 }}
                    />
                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                      style={{ maxWidth: 120 }}
                    >
                      <option value="">전체 상태</option>
                      <option value="active">활성</option>
                      <option value="pending">승인대기</option>
                      <option value="blocked">차단</option>
                    </select>
                  </div>

                  <button className="btn btn-purple btn-sm" type="button" onClick={openNewUserModal}>
                    ➕ 새 계정 추가
                  </button>
                </div>

                {pendingUsers.length > 0 && (
                  <div className="alert alert-yellow" style={{ marginBottom: 12 }}>
                    ⚠️ 승인 대기 중인 계정이 {pendingUsers.length}개 있습니다:{" "}
                    {pendingUsers.map((u) => `${u.name}(${u.id})`).join(", ")}
                  </div>
                )}

                <div className="tbl-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>아이디</th>
                        <th>이름</th>
                        <th>회사명</th>
                        <th>연락처</th>
                        <th>권한</th>
                        <th>상태</th>
                        <th>접수건수</th>
                        <th>등록일</th>
                        <th>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((u) => {
                          const count = allReceipts.filter((r) => r.userId === u.id).length;
                          return (
                            <tr key={u.id}>
                              <td style={{ fontWeight: 700, color: "var(--blue2)" }}>{u.id}</td>
                              <td><strong>{u.name}</strong></td>
                              <td>{u.company || "-"}</td>
                              <td style={{ whiteSpace: "nowrap" }}>{u.phone || "-"}</td>
                              <td>
                                {u.role === "admin" ? (
                                  <span className="badge badge-purple">관리자</span>
                                ) : (
                                  <span className="badge badge-blue">일반</span>
                                )}
                              </td>
                              <td>
                                {u.status === "active" ? (
                                  <span className="us-active">활성</span>
                                ) : u.status === "pending" ? (
                                  <span className="us-pending">승인대기</span>
                                ) : (
                                  <span className="us-blocked">차단</span>
                                )}
                              </td>
                              <td>{count}건</td>
                              <td>{u.createdAt || "-"}</td>
                              <td>
                                <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
                                  {u.status === "pending" && (
                                    <button className="btn btn-success btn-sm" type="button" onClick={() => quickApprove(u.id)}>
                                      승인
                                    </button>
                                  )}

                                  {u.status === "active" && u.role !== "admin" && (
                                    <button className="btn btn-gray btn-sm" type="button" onClick={() => quickBlock(u.id)}>
                                      차단
                                    </button>
                                  )}

                                  {u.status === "blocked" && (
                                    <button className="btn btn-outline btn-sm" type="button" onClick={() => quickApprove(u.id)}>
                                      활성화
                                    </button>
                                  )}

                                  <button className="btn btn-yellow btn-sm" type="button" onClick={() => openEditUserModal(u)}>
                                    수정
                                  </button>

                                  {(u.role !== "admin" || allUsers.filter((x) => x.role === "admin").length > 1) && (
                                    <button className="btn btn-danger btn-sm" type="button" onClick={() => deleteUser(u.id)}>
                                      삭제
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={9} style={{ color: "var(--gray)", padding: 20 }}>
                            사용자가 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "chart" && isAdmin && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="card">
              <div className="card-header">📊 렌탈 브랜드별 접수 현황</div>
              <div className="card-body">
                {brandCounts.length > 0 ? (
                  brandCounts.map(([name, count], idx) => {
                    const max = brandCounts[0][1] || 1;
                    const color = brands.find((b) => b.name === name)?.color || "#2563EB";
                    return (
                      <div key={`${name}-${idx}`} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <div style={{ fontSize: 12, minWidth: 90, color: "var(--text2)", textAlign: "right", whiteSpace: "nowrap" }}>
                          {name}
                        </div>
                        <div style={{ flex: 1, background: "var(--gray-light)", borderRadius: 4, height: 22, overflow: "hidden" }}>
                          <div
                            style={{
                              background: color,
                              height: "100%",
                              width: `${Math.round((count / max) * 100)}%`,
                              borderRadius: 4,
                            }}
                          />
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, minWidth: 28 }}>{count}</div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ color: "var(--gray)", fontSize: 13 }}>데이터 없음</div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">📈 상태별 현황</div>
              <div className="card-body">
                {statusCounts.map((item) => {
                  const max = Math.max(...statusCounts.map((s) => s.value), 1);
                  const color =
                    item.label === "접수"
                      ? "#1D4ED8"
                      : item.label === "상담중"
                      ? "#D97706"
                      : item.label === "계약완료"
                      ? "#059669"
                      : item.label === "설치완료"
                      ? "#6B7280"
                      : "#DC2626";

                  return (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
                      <div style={{ fontSize: 12, minWidth: 60 }}>{item.label}</div>
                      <div style={{ flex: 1, background: "var(--gray-light)", borderRadius: 4, height: 18, overflow: "hidden" }}>
                        <div
                          style={{
                            background: color,
                            height: "100%",
                            width: `${Math.round((item.value / max) * 100)}%`,
                            borderRadius: 4,
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{item.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card" style={{ gridColumn: "1 / -1" }}>
              <div className="card-header">📅 월별 접수 추이</div>
              <div className="card-body">
                <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 110 }}>
                  {monthlyCounts.map((m, idx) => {
                    const max = Math.max(...monthlyCounts.map((x) => x.value), 1);
                    return (
                      <div key={m.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ fontSize: 11, color: "var(--blue2)", fontWeight: 700 }}>{m.value}</div>
                        <div
                          style={{
                            width: "100%",
                            background: idx === monthlyCounts.length - 1 ? "var(--blue2)" : "#bfdbfe",
                            borderRadius: "4px 4px 0 0",
                            height: `${Math.round((m.value / max) * 70) + 8}px`,
                          }}
                        />
                        <div style={{ fontSize: 10, color: "var(--gray)" }}>{m.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "products" && isAdmin && (
          <>
            <div className="card">
              <div className="card-header dark">⚙️ 브랜드 관리</div>
              <div className="card-body">
                <div className="alert alert-info">
                  브랜드 이름을 수정하고 저장 버튼을 클릭하세요. 색상 코드도 변경할 수 있습니다.
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
                    gap: 12,
                    marginTop: 10,
                  }}
                >
                  {brands.map((b, index) => (
                    <div
                      key={b.id}
                      style={{
                        border: `2px solid ${b.color}40`,
                        borderLeft: `4px solid ${b.color}`,
                        borderRadius: 10,
                        padding: 14,
                        background: "#fff",
                      }}
                    >
                      <div style={{ fontSize: 11, color: "var(--gray)", marginBottom: 4 }}>브랜드 이름</div>
                      <input
                        value={b.name}
                        onChange={(e) => saveBrandName(index, e.target.value)}
                        style={{
                          marginBottom: 10,
                          borderColor: `${b.color}60`,
                          color: b.color,
                          fontWeight: 700,
                        }}
                      />

                      <div style={{ fontSize: 11, color: "var(--gray)", marginBottom: 4 }}>색상 코드</div>
                      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                        <input
                          type="color"
                          value={b.color}
                          onChange={(e) => saveBrandColor(index, e.target.value)}
                          style={{ width: 40, height: 32, padding: 2 }}
                        />
                        <input
                          value={b.color}
                          onChange={(e) => saveBrandColor(index, e.target.value)}
                          disabled={b.id === "etc"}
                        />
                      </div>

                      {b.id !== "etc" && (
                        <button className="btn btn-danger btn-sm" style={{ width: "100%" }} onClick={() => deleteBrand(index)}>
                          🗑️ 브랜드 삭제
                        </button>
                      )}
                    </div>
                  ))}

                  <div
                    style={{
                      border: "2px dashed var(--blue2)",
                      borderRadius: 10,
                      padding: 14,
                      background: "#f8faff",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--blue2)" }}>
                      ➕ 새 브랜드 등록
                    </div>
                    <input
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      placeholder="브랜드명 입력"
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        type="color"
                        value={newBrandColor}
                        onChange={(e) => setNewBrandColor(e.target.value)}
                        style={{ width: 38, height: 32, padding: 2 }}
                      />
                      <input
                        value={newBrandColor}
                        onChange={(e) => setNewBrandColor(e.target.value)}
                      />
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={addBrand}>
                      브랜드 등록
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <button className="btn btn-success btn-sm" onClick={persistBrands}>
                    💾 브랜드 저장
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header dark">📋 품목(카테고리) 관리</div>
              <div className="card-body">
                <div className="alert alert-info">
                  모든 브랜드에 공통 적용되는 제품 카테고리 목록입니다.
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                  {subcats.map((c, index) => (
                    <div
                      key={`${c}-${index}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        background: "#f0f5ff",
                        border: "1.5px solid #bfdbfe",
                        borderRadius: 8,
                        padding: "4px 8px",
                      }}
                    >
                      <input
                        value={c}
                        onChange={(e) => updateSubcat(index, e.target.value)}
                        style={{
                          border: "none",
                          background: "transparent",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--blue2)",
                          outline: "none",
                          width: Math.max(60, c.length * 13),
                          padding: 0,
                        }}
                      />
                      <button
                        onClick={() => removeSubcat(index)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--red)",
                          fontSize: 14,
                          cursor: "pointer",
                          padding: "0 2px",
                        }}
                        title="삭제"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    value={newSubcat}
                    onChange={(e) => setNewSubcat(e.target.value)}
                    placeholder="새 품목명 입력"
                    style={{ maxWidth: 200 }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addSubcat();
                    }}
                  />
                  <button className="btn btn-primary btn-sm" onClick={addSubcat}>
                    ➕ 품목 추가
                  </button>
                  <button className="btn btn-success btn-sm" onClick={persistSubcats}>
                    💾 품목 전체 저장
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {detailOpen && selectedReceipt && (
          <div className="modal-overlay show" onClick={closeDetailModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>📋 접수 상세 정보</h3>
                <button className="modal-close" onClick={closeDetailModal}>
                  ✕
                </button>
              </div>

              <table style={{ width: "100%", fontSize: 13, marginBottom: 10, borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ color: "var(--gray)", padding: "5px 0", width: 90 }}>접수번호</td>
                    <td style={{ padding: "5px 0", fontWeight: 700, color: "var(--blue2)" }}>{selectedReceipt.num}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--gray)", padding: "5px 0" }}>고객명</td>
                    <td style={{ padding: "5px 0" }}><strong>{selectedReceipt.name}</strong></td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--gray)", padding: "5px 0" }}>연락처</td>
                    <td style={{ padding: "5px 0" }}>{selectedReceipt.phone}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--gray)", padding: "5px 0" }}>설치주소</td>
                    <td style={{ padding: "5px 0" }}>{selectedReceipt.addr || "-"}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--gray)", padding: "5px 0", verticalAlign: "top" }}>제품</td>
                    <td style={{ padding: "5px 0", lineHeight: 1.7 }}>
                      {(selectedReceipt.productDetails?.length
                        ? selectedReceipt.productDetails.map((p: any) => {
                            let s = `${p.brand} ${p.category}`;
                            if (p.productName) s += ` ${p.productName}`;
                            if (p.modelName) s += ` [${p.modelName}]`;
                            if (p.color) s += ` (${p.color})`;
                            if (p.qty > 1) s += ` x${p.qty}`;
                            if (p.managementType) s += ` | 관리: ${p.managementType}`;
                            if (p.promotion) s += ` | 프로모션: ${p.promotion}`;
                            if (p.contractPeriod) s += ` | 약정: ${p.contractPeriod}`;
                            if (p.rentalFee) s += ` | 렌탈료: ${p.rentalFee}`;
                            return s;
                          })
                        : selectedReceipt.products || []
                      ).map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--gray)", padding: "5px 0" }}>결제방법</td>
                    <td style={{ padding: "5px 0" }}>{selectedReceipt.payMethod || "-"}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--gray)", padding: "5px 0" }}>고객유형</td>
                    <td style={{ padding: "5px 0" }}>{selectedReceipt.custType || "개인"}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--gray)", padding: "5px 0" }}>접수채널</td>
                    <td style={{ padding: "5px 0" }}>{selectedReceipt.channel}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--gray)", padding: "5px 0" }}>담당자</td>
                    <td style={{ padding: "5px 0" }}>{selectedReceipt.agent}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--gray)", padding: "5px 0" }}>접수자</td>
                    <td style={{ padding: "5px 0" }}>{selectedReceipt.userName || selectedReceipt.userId || "-"}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--gray)", padding: "5px 0" }}>접수일</td>
                    <td style={{ padding: "5px 0" }}>{selectedReceipt.date}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--gray)", padding: "5px 0" }}>현재상태</td>
                    <td style={{ padding: "5px 0" }}>
                      <span className={`badge ${statusBadgeClass(selectedReceipt.status)}`}>
                        {selectedReceipt.status}
                      </span>
                    </td>
                  </tr>
                  {selectedReceipt.memo ? (
                    <tr>
                      <td style={{ color: "var(--gray)", padding: "5px 0" }}>메모</td>
                      <td style={{ padding: "5px 0" }}>{selectedReceipt.memo}</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>

              <div className="btn-row">
                {isAdmin && (
                  <>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      style={{
                        fontSize: 13,
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1.5px solid var(--gray-border)",
                      }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={updateStatus}>
                      상태 변경
                    </button>
                  </>
                )}
                <button className="btn btn-gray btn-sm" onClick={closeDetailModal}>
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {userModalOpen && (
          <div className="modal-overlay show" onClick={closeUserModal}>
            <div className="modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingUserId ? "✏️ 계정 수정" : "➕ 새 계정 추가"}</h3>
                <button className="modal-close" onClick={closeUserModal}>
                  ✕
                </button>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><span className="req">*</span> 아이디</label>
                  <input value={umId} disabled={!!editingUserId} onChange={(e) => setUmId(e.target.value)} />
                </div>
                <div className="form-group">
                  <label><span className="req">*</span> 비밀번호</label>
                  <input type="password" value={umPw} onChange={(e) => setUmPw(e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><span className="req">*</span> 이름</label>
                  <input value={umName} onChange={(e) => setUmName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>회사명</label>
                  <input value={umCompany} onChange={(e) => setUmCompany(e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>연락처</label>
                  <input value={umPhone} onChange={(e) => setUmPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>권한</label>
                  <select value={umRole} onChange={(e) => setUmRole(e.target.value as "admin" | "user")}>
                    <option value="user">일반 사용자</option>
                    <option value="admin">관리자</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>계정 상태</label>
                <select value={umStatus} onChange={(e) => setUmStatus(e.target.value as "active" | "pending" | "blocked")}>
                  <option value="active">활성 (로그인 가능)</option>
                  <option value="pending">승인대기</option>
                  <option value="blocked">차단 (로그인 불가)</option>
                </select>
              </div>

              <div className="form-group">
                <label>메모</label>
                <input value={umMemo} onChange={(e) => setUmMemo(e.target.value)} />
              </div>

              <div className="btn-row">
                <button className="btn btn-gray btn-sm" onClick={closeUserModal}>
                  취소
                </button>
                <button className="btn btn-primary" onClick={saveUser}>
                  저장
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}