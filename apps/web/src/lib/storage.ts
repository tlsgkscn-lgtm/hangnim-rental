export type UserRole = "admin" | "user";
export type UserStatus = "active" | "pending" | "blocked";
export type ReceiptStatus = "접수" | "상담중" | "계약완료" | "설치완료" | "취소";

export type AppUser = {
  id: string;       // DB UUID (API 호출용)
  loginId: string;  // 로그인 아이디 (표시용)
  pw: string;
  name: string;
  company?: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  memo?: string;
};

export type ProductDetail = {
  brand: string;
  category: string;
  productName?: string;
  modelName?: string;
  color?: string;
  qty: number;
};

export type ReceiptAttachment = {
  id?: string;
  type: "BUSINESS_DOC" | "ETC_DOC" | "PERSONAL_DOC";
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  fileSize?: number;
};

export type Receipt = {
  id?: string;
  num: string;
  date: string;
  name: string;
  phone: string;
  addr?: string;
  products: string[];
  productDetails?: any[];
  attachments?: ReceiptAttachment[];
  period?: number;
  monthly?: number;
  status: "접수" | "상담중" | "계약완료" | "설치완료" | "취소";
  agent?: string;
  channel?: string;
  memo?: string;
  payMethod?: string;
  bankName?: string;
  bankAccount?: string;
  cardCompany?: string;
  cardNumber?: string;
  cardExpiry?: string;
  payEtc?: string;
  custType?: string;
  userId?: string;
  userName?: string;
  createdAt?: string;
};

const PREFIX = "wj_";

const BRANDS = ["코웨이", "SK매직", "청호나이스", "LG전자", "쿠쿠"];
const CATS = ["정수기", "공기청정기", "비데", "정수기", "공기청정기"];
const NAMES = ["김철수", "이영희", "박지민", "최수현", "정민준", "한소영", "오준혁", "신미래"];
const STATUSES: ReceiptStatus[] = ["접수", "상담중", "계약완료", "설치완료", "취소"];
const AGENTS = ["홍길동", "김영업", "이대리", "박팀장"];
const USER_IDS = ["dealer01", "dealer03", "admin"];

function isBrowser() {
  return typeof window !== "undefined";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function getJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const value = window.localStorage.getItem(PREFIX + key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setJSON<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function initializeMockData() {
  if (!isBrowser()) return;

  const users = getUsers();
  if (!users.length) {
    const defaultUsers: AppUser[] = [
      {
        id: "admin",
        loginId: "admin",
        pw: "admin1234",
        name: "관리자",
        company: "우리집렌탈",
        phone: "010-0000-0000",
        role: "admin",
        status: "active",
        createdAt: today(),
        memo: "기본 관리자",
      },
      {
        id: "dealer01",
        loginId: "dealer01",
        pw: "1234",
        name: "김영업",
        company: "(주)ABC렌탈",
        phone: "010-1234-5678",
        role: "user",
        status: "active",
        createdAt: today(),
        memo: "강남 담당",
      },
      {
        id: "dealer02",
        loginId: "dealer02",
        pw: "1234",
        name: "이대리",
        company: "XYZ유통",
        phone: "010-9876-5432",
        role: "user",
        status: "pending",
        createdAt: today(),
        memo: "신규 거래처",
      },
      {
        id: "dealer03",
        loginId: "dealer03",
        pw: "1234",
        name: "박팀장",
        company: "한국렌탈서비스",
        phone: "010-5555-1234",
        role: "user",
        status: "active",
        createdAt: today(),
        memo: "",
      },
    ];
    setUsers(defaultUsers);
  }

  const receipts = getReceipts();
  if (!receipts.length) {
    const nextReceipts: Receipt[] = [];
    for (let i = 0; i < 20; i++) {
      const d = new Date(2026, 2, 1);
      d.setDate(d.getDate() + i * 3);

      nextReceipts.push({
        num: `WR-202603-${String(i + 1).padStart(4, "0")}`,
        date: d.toISOString().slice(0, 10),
        name: NAMES[i % NAMES.length],
        phone: `010-${String(1000 + i * 37)}-${String(5000 + i * 13)}`,
        products: [`${BRANDS[i % BRANDS.length]} ${CATS[i % CATS.length]}`],
        productDetails: [
          {
            brand: BRANDS[i % BRANDS.length],
            category: CATS[i % CATS.length],
            color: "화이트",
            qty: 1,
          },
        ],
        period: 60,
        monthly: 0,
        status: STATUSES[i % STATUSES.length],
        agent: AGENTS[i % AGENTS.length],
        addr: `서울시 강남구 테헤란로 ${(i + 1) * 10}호`,
        channel: "방문영업",
        memo: "",
        payMethod: "은행",
        bankName: "국민은행",
        bankAccount: "",
        cardCompany: "",
        cardNumber: "",
        cardExpiry: "",
        payEtc: "",
        custType: "개인",
        userId: USER_IDS[i % USER_IDS.length],
        userName:
          USER_IDS[i % USER_IDS.length] === "admin"
            ? "관리자"
            : USER_IDS[i % USER_IDS.length] === "dealer01"
            ? "김영업"
            : "박팀장",
        createdAt: d.toISOString().slice(0, 10),
      });
    }
    setReceipts(nextReceipts);
  }
}

export function getUsers() {
  return getJSON<AppUser[]>("users", []);
}

export function setUsers(users: AppUser[]) {
  setJSON("users", users);
}

export function getReceipts() {
  return getJSON<Receipt[]>("receipts", []);
}

export function setReceipts(receipts: Receipt[]) {
  setJSON("receipts", receipts);
}

export function formatPhone(value: string) {
  const v = value.replace(/\D/g, "");
  if (v.length <= 3) return v;
  if (v.length <= 7) return `${v.slice(0, 3)}-${v.slice(3)}`;
  return `${v.slice(0, 3)}-${v.slice(3, 7)}-${v.slice(7, 11)}`;
}

export function formatCard(value: string) {
  const v = value.replace(/\D/g, "").slice(0, 16);
  return v.replace(/(.{4})/g, "$1-").replace(/-$/, "");
}

export function formatExpiry(value: string) {
  const v = value.replace(/\D/g, "").slice(0, 4);
  return v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v;
}

export function statusBadgeClass(status: ReceiptStatus) {
  const map: Record<ReceiptStatus, string> = {
    접수: "badge-blue",
    상담중: "badge-yellow",
    계약완료: "badge-green",
    설치완료: "badge-gray",
    취소: "badge-red",
  };
  return map[status] ?? "badge-gray";
}

export function createReceiptNumber() {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `WR-${ym}-${String(getReceipts().length + 1).padStart(4, "0")}`;
}

export type SessionUser = {
  id: string;
  name: string;
  role: UserRole;
};

export function getSession() {
  return getJSON<SessionUser | null>("session", null);
}

export function setSession(session: SessionUser) {
  setJSON("session", session);
}

export function clearSession() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(PREFIX + "session");
}

export function loginWithLocalStorage(id: string, pw: string) {
  const users = getUsers();
  const user = users.find((u) => u.id === id && u.pw === pw);

  if (!user) {
    return {
      ok: false as const,
      message: "아이디 또는 비밀번호가 올바르지 않습니다.",
    };
  }

  if (user.status === "pending") {
    return {
      ok: false as const,
      message: "계정 승인 대기 중입니다. 관리자에게 문의해 주세요.",
    };
  }

  if (user.status === "blocked") {
    return {
      ok: false as const,
      message: "차단된 계정입니다. 관리자에게 문의해 주세요.",
    };
  }

  const session: SessionUser = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  setSession(session);

  return {
    ok: true as const,
    session,
  };
}