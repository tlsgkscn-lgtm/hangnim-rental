"use client";


import { apiFetch } from '../../lib/api';
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "../../components/layout/top-nav";
import {
  createReceiptNumber,
  formatCard,
  formatExpiry,
  formatPhone,
  getReceipts,
  getSession,
  initializeMockData,
  setReceipts,
} from "../../lib/storage";

type Brand = {
  id: string;
  name: string;
  color: string;
};

type SelectedItem = {
  uid: string;
  brandId: string;
  brandName: string;
  brandColor: string;
  category: string;
  productName: string;
  modelName: string;
  color: string;
  qty: number;
  managementType: string;
  promotion: string;
  contractPeriod: string;
  rentalFee: string;
  customBrand: string;
};

const BRANDS: Brand[] = [
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

const SUB_CATEGORIES = ["정수기", "공기청정기", "비데", "기타 상품"];
const MOCK_ADDRESSES = [
  {
    zip: "44248",
    road: "울산 북구 명촌3길 21",
    jibun: "울산 북구 진장동 890",
  },
  {
    zip: "06164",
    road: "서울 강남구 테헤란로 152",
    jibun: "서울 강남구 역삼동 737",
  },
  {
    zip: "48058",
    road: "부산 해운대구 센텀중앙로 97",
    jibun: "부산 해운대구 재송동 1212",
  },
  {
    zip: "35229",
    road: "대전 서구 둔산로 100",
    jibun: "대전 서구 둔산동 1413",
  },
];




export default function ApplyPage() {


  const router = useRouter();

  const [addrOpen, setAddrOpen] = useState(false);
  const [addrKeyword, setAddrKeyword] = useState("");
  const [addrResults, setAddrResults] = useState(MOCK_ADDRESSES);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const [custName, setCustName] = useState("");
  const [resnumFront, setResnumFront] = useState("");
  const [custGender, setCustGender] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custZip, setCustZip] = useState("");
  const [custAddr1, setCustAddr1] = useState("");
  const [custAddr2, setCustAddr2] = useState("");
  const [custInstallDate, setCustInstallDate] = useState("");
  const [custMemo, setCustMemo] = useState("");

  const [rentPay, setRentPay] = useState<"은행" | "신용카드" | "기타">("은행");
  const [rentDay, setRentDay] = useState("5일");

  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");

  const [cardCompany, setCardCompany] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");

  const [payEtcMemo, setPayEtcMemo] = useState("");

  const [rentAgent, setRentAgent] = useState("");
  const [rentChannel, setRentChannel] = useState("방문영업");
  const [rentCtype, setRentCtype] = useState<"개인" | "사업자" | "기타">("개인");

  const [bizFiles, setBizFiles] = useState<string[]>([]);
  const [etcFiles, setEtcFiles] = useState<string[]>([]);
  const [personalEtcFiles, setPersonalEtcFiles] = useState<string[]>([]);

  const [submittedNum, setSubmittedNum] = useState("");
  const [submittedDate, setSubmittedDate] = useState("");
  const [submittedProducts, setSubmittedProducts] = useState<string[]>([]);

  const openAddrSearch = () => {
    setAddrKeyword("");
    setAddrResults(MOCK_ADDRESSES);
    setAddrOpen(true);
  };

  const closeAddrSearch = () => {
    setAddrOpen(false);
  };

  const doAddrSearch = () => {
    const q = addrKeyword.trim().toLowerCase();

    if (!q) {
      setAddrResults(MOCK_ADDRESSES);
      return;
    }

    const filtered = MOCK_ADDRESSES.filter((item) => {
      return (
        item.road.toLowerCase().includes(q) ||
        item.jibun.toLowerCase().includes(q) ||
        item.zip.includes(q)
      );
    });

    setAddrResults(filtered);
  };

  const selectAddr = (zip: string, road: string) => {
    setCustZip(zip);
    setCustAddr1(road);
    setCustAddr2("");
    setAddrOpen(false);

    setTimeout(() => {
      const input = document.getElementById("cust-addr2") as HTMLInputElement | null;
      input?.focus();
    }, 120);
  };


  useEffect(() => {
    initializeMockData();
    const session = getSession();
    if (!session) {
      router.replace("/login");
    }
  }, [router]);

  const activeBrand = useMemo(
    () => BRANDS.find((b) => b.id === activeBrandId) ?? null,
    [activeBrandId]
  );

  const totalQty = useMemo(
    () => selectedItems.reduce((sum, item) => sum + (Number(item.qty) || 1), 0),
    [selectedItems]
  );

  const addItem = (brandId: string, category: string) => {
    const brand = BRANDS.find((b) => b.id === brandId);
    if (!brand) return;

    setSelectedItems((prev) => [
      ...prev,
      {
        uid: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        brandId: brand.id,
        brandName: brand.name,
        brandColor: brand.color,
        category,
        productName: "",
        modelName: "",
        color: "",
        qty: 1,
        managementType: "",
        promotion: "",
        contractPeriod: "",
        rentalFee: "",
        customBrand: "",
      },
    ]);
  };

  const updateItem = (
    uid: string,
    field: keyof SelectedItem,
    value: string | number
  ) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.uid === uid ? { ...item, [field]: value } : item
      )
    );
  };

  const removeItem = (uid: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.uid !== uid));
  };

  const fileNames = (e: ChangeEvent<HTMLInputElement>) =>
    Array.from(e.target.files ?? []).map((f) => f.name);


  const validateStep1 = () => {
    if (!selectedItems.length) {
      alert("제품을 1개 이상 추가해 주세요.");
      return false;
    }

    for (const item of selectedItems) {
      const brandLabel =
        item.brandId === "etc" ? item.customBrand || item.brandName : item.brandName;
      const label = `[${brandLabel} ${item.category}]`;

      if (item.brandId === "etc" && !item.customBrand.trim()) {
        alert(`${label} 브랜드명을 입력해 주세요.`);
        return false;
      }
      if (!item.productName.trim()) {
        alert(`${label} 제품명을 입력해 주세요.`);
        return false;
      }
      if (!item.modelName.trim()) {
        alert(`${label} 모델명을 입력해 주세요.`);
        return false;
      }
      if (!item.color.trim()) {
        alert(`${label} 제품색상을 입력해 주세요.`);
        return false;
      }
      if (!item.managementType.trim()) {
        alert(`${label} 관리방법을 입력해 주세요.`);
        return false;
      }
      if (!item.promotion.trim()) {
        alert(`${label} 프로모션을 입력해 주세요.`);
        return false;
      }
      if (!item.contractPeriod.trim()) {
        alert(`${label} 약정기간을 입력해 주세요.`);
        return false;
      }
      if (!item.rentalFee.trim()) {
        alert(`${label} 렌탈료를 입력해 주세요.`);
        return false;
      }
    }

    return true;
  };

  const validateStep2 = () => {
    if (!custName.trim()) {
      alert("고객명을 입력해 주세요.");
      return false;
    }
    if (!resnumFront.trim() || resnumFront.length !== 6) {
      alert("주민등록번호 앞자리 6자리를 입력해 주세요.");
      return false;
    }
    if (!custGender) {
      alert("성별을 선택해 주세요.");
      return false;
    }
    if (!custPhone.trim()) {
      alert("휴대폰 번호를 입력해 주세요.");
      return false;
    }
    if (!custAddr1.trim() && !custAddr2.trim()) {
      alert("설치 주소를 입력해 주세요.");
      return false;
    }

    if (rentPay === "은행") {
      if (!bankName.trim()) {
        alert("은행명을 입력해 주세요.");
        return false;
      }
      if (!bankAccount.trim()) {
        alert("계좌번호를 입력해 주세요.");
        return false;
      }
    }

    if (rentPay === "신용카드") {
      if (!cardCompany.trim()) {
        alert("카드사를 입력해 주세요.");
        return false;
      }
      if (!cardNumber.trim()) {
        alert("카드번호를 입력해 주세요.");
        return false;
      }
    }

    return true;
  };

  const goStep = (next: 1 | 2 | 3) => {
    if (next === 2 && !validateStep1()) return;
    if (next === 3 && !validateStep2()) return;
    setStep(next);
  };

  const productSummaryLines = useMemo(() => {
    return selectedItems.map((item) => {
      const brandName =
        item.brandId === "etc" && item.customBrand.trim()
          ? item.customBrand.trim()
          : item.brandName;

      return `${brandName} ${item.category}${item.productName ? ` ${item.productName}` : ""}${
        item.modelName ? ` [${item.modelName}]` : ""
      }${item.color ? ` (${item.color})` : ""}${item.qty > 1 ? ` x${item.qty}` : ""}${
        item.contractPeriod ? ` / ${item.contractPeriod}` : ""
      }${item.rentalFee ? ` ${item.rentalFee}` : ""}`;
    });
  }, [selectedItems]);

  const submitForm = async () => {
  try {
    const session = getSession();

    const payload = {
      customerName: custName,
      residentNoFront: resnumFront,
      gender: custGender,
      phone: custPhone,
      email: custEmail || undefined,

      zipCode: custZip || undefined,
      address1: custAddr1,
      address2: custAddr2 || undefined,

      installHopeDate: custInstallDate
        ? new Date(custInstallDate).toISOString()
        : undefined,
      memo: custMemo || undefined,

      paymentMethod:
        rentPay === '은행'
          ? 'BANK'
          : rentPay === '신용카드'
          ? 'CARD'
          : 'ETC',

      paymentDay: rentDay ? Number(String(rentDay).replace(/\D/g, '')) : undefined,

      bankName: rentPay === '은행' ? bankName || undefined : undefined,
      bankAccount: rentPay === '은행' ? bankAccount || undefined : undefined,

      cardCompany: rentPay === '신용카드' ? cardCompany || undefined : undefined,
      cardNumber: rentPay === '신용카드' ? cardNumber || undefined : undefined,
      cardExpiry: rentPay === '신용카드' ? cardExpiry || undefined : undefined,

      paymentEtcMemo: rentPay === '기타' ? payEtcMemo || undefined : undefined,

      salesAgent: rentAgent || undefined,
      receptionChannel: rentChannel || undefined,

      customerType:
        rentCtype === '개인'
          ? 'PERSONAL'
          : rentCtype === '사업자'
          ? 'BUSINESS'
          : 'ETC',

      products: selectedItems.map((item) => ({
        customBrandName:
          item.brandId === 'etc'
            ? item.customBrand || undefined
            : item.brandName || undefined,

        customCategoryName: item.category,

        productName: item.productName,
        modelName: item.modelName,
        color: item.color,
        quantity: Number(item.qty || 1),

        managementType: item.managementType,
        promotion: item.promotion,
        contractPeriod: item.contractPeriod,
        rentalFee: item.rentalFee,
      })),

      attachments: [],
    };

    const created = await apiFetch<{
      id: string;
      receiptNumber: string;
      createdAt: string;
      products: Array<{
        productName: string;
        modelName: string;
      }>;
    }>('/receipts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setSubmittedNum(created.receiptNumber);
    setSubmittedDate(created.createdAt.slice(0, 10));
    setSubmittedProducts(
      selectedItems.map((item) => {
        const brandDisplay =
          item.brandId === 'etc' && item.customBrand?.trim()
            ? item.customBrand.trim()
            : item.brandName;

        return `${brandDisplay} ${item.category}${item.productName ? ` ${item.productName}` : ''}${
          item.modelName ? ` [${item.modelName}]` : ''
        }${item.color ? ` (${item.color})` : ''}${item.qty > 1 ? ` x${item.qty}` : ''}`;
      }),
    );

    setStep(3);
    alert(`✅ 접수 완료\n접수번호: ${created.receiptNumber}`);
  } catch (err) {
    alert(err instanceof Error ? err.message : '접수 중 오류가 발생했습니다.');
  }
};

  const resetForm = () => {
    setStep(1);
    setActiveBrandId(null);
    setSelectedItems([]);

    setCustName("");
    setResnumFront("");
    setCustGender("");
    setCustPhone("");
    setCustEmail("");
    setCustZip("");
    setCustAddr1("");
    setCustAddr2("");
    setCustInstallDate("");
    setCustMemo("");

    setRentPay("은행");
    setRentDay("5일");
    setBankName("");
    setBankAccount("");
    setCardCompany("");
    setCardNumber("");
    setCardExpiry("");
    setPayEtcMemo("");
    setRentAgent("");
    setRentChannel("방문영업");
    setRentCtype("개인");

    setBizFiles([]);
    setEtcFiles([]);
    setPersonalEtcFiles([]);
  };

  const renderFileTags = (files: string[]) => (
    <div className="file-list">
      {files.map((name) => (
        <span key={name} className="file-tag">
          📄 {name}
        </span>
      ))}
    </div>
  );

  return (
    <>
      <TopNav active="apply" />

      <main className="page">
        <div className="step-bar" style={{ marginTop: 4 }}>
          <div className="step-item">
            <div className={`step-num ${step >= 1 ? "done" : ""}`}>1</div>
            <div className={`step-label ${step >= 1 ? "done" : ""}`}>제품선택</div>
          </div>
          <div className={`step-line ${step > 1 ? "done" : ""}`}></div>
          <div className="step-item">
            <div className={`step-num ${step >= 2 ? "done" : ""}`}>2</div>
            <div className={`step-label ${step >= 2 ? "done" : ""}`}>고객정보입력</div>
          </div>
          <div className={`step-line ${step > 2 ? "done" : ""}`}></div>
          <div className="step-item">
            <div className={`step-num ${step >= 3 ? "done" : ""}`}>3</div>
            <div className={`step-label ${step >= 3 ? "done" : ""}`}>확인/제출</div>
          </div>
        </div>

        {step === 1 && (
          <>
            <div className="card">
              <div className="card-header">📦 1단계: 렌탈 제품정보 입력</div>
              <div className="card-body">
                <div className="alert alert-info">
                  브랜드를 선택하면 제품 종류가 표시됩니다. (복수 추가 가능)
                </div>

                <div style={{ marginBottom: 4, fontSize: 12, fontWeight: 700, color: "var(--text2)" }}>
                  브랜드 선택
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(100px,1fr))",
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  {BRANDS.map((brand) => {
                    const active = activeBrandId === brand.id;
                    return (
                      <div
                        key={brand.id}
                        onClick={() => setActiveBrandId(brand.id)}
                        style={{
                          border: `2.5px solid ${active ? brand.color : "#e5e7eb"}`,
                          borderRadius: 10,
                          padding: "12px 6px 8px",
                          cursor: "pointer",
                          textAlign: "center",
                          background: active ? `${brand.color}15` : "#fff",
                          transition: "all .15s",
                        }}
                      >
                        <div
                          style={{
                            height: 40,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 5,
                            fontSize: 13,
                            fontWeight: 900,
                            color: brand.color,
                          }}
                        >
                          {brand.name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: active ? brand.color : "#374151",
                          }}
                        >
                          {brand.name}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {activeBrand && (
                  <div
                    style={{
                      background: "#f0f5ff",
                      border: `2px solid ${activeBrand.color}`,
                      borderRadius: 10,
                      padding: 14,
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: activeBrand.color,
                        marginBottom: 10,
                      }}
                    >
                      {activeBrand.name} — 제품 종류를 선택하세요
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4,1fr)",
                        gap: 8,
                      }}
                    >
                      {SUB_CATEGORIES.map((cat) => (
                        <div
                          key={cat}
                          onClick={() => addItem(activeBrand.id, cat)}
                          style={{
                            border: `2px solid ${activeBrand.color}`,
                            borderRadius: 8,
                            padding: "12px 6px",
                            cursor: "pointer",
                            textAlign: "center",
                            background: "#fff",
                            fontSize: 13,
                            fontWeight: 700,
                            color: activeBrand.color,
                          }}
                        >
                          {cat === "정수기"
                            ? "💧 "
                            : cat === "공기청정기"
                            ? "💨 "
                            : cat === "비데"
                            ? "🚿 "
                            : "📦 "}
                          {cat}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItems.length > 0 && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)", marginBottom: 8 }}>
                      선택된 제품 목록
                    </div>

                    {selectedItems.map((item) => (
                      <div
                        key={item.uid}
                        style={{
                          background: "#fff",
                          border: "1.5px solid #e5e7eb",
                          borderLeft: `4px solid ${item.brandColor}`,
                          borderRadius: 10,
                          padding: "12px 14px",
                          marginBottom: 10,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 10,
                          }}
                        >
                          <div>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: item.brandColor,
                                background: `${item.brandColor}15`,
                                padding: "2px 9px",
                                borderRadius: 10,
                              }}
                            >
                              {item.brandName}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#111", marginLeft: 6 }}>
                              {item.category}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.uid)}
                            style={{
                              background: "var(--red-light)",
                              color: "var(--red)",
                              border: "none",
                              borderRadius: 6,
                              padding: "4px 10px",
                              fontSize: 11,
                              cursor: "pointer",
                            }}
                          >
                            ✕ 삭제
                          </button>
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end", marginBottom: 8 }}>
                          <div style={{ flex: 1, minWidth: 130 }}>
                            <label style={{ fontSize: 11, color: "var(--red)", display: "block", marginBottom: 2 }}>
                              * 제품명
                            </label>
                            <input
                              value={item.productName}
                              onChange={(e) => updateItem(item.uid, "productName", e.target.value)}
                              placeholder="예: 아이콘 정수기"
                            />
                          </div>

                          <div style={{ flex: 1, minWidth: 110 }}>
                            <label style={{ fontSize: 11, color: "var(--red)", display: "block", marginBottom: 2 }}>
                              * 모델명
                            </label>
                            <input
                              value={item.modelName}
                              onChange={(e) => updateItem(item.uid, "modelName", e.target.value)}
                              placeholder="예: CHP-7210N"
                            />
                          </div>

                          <div style={{ minWidth: 90 }}>
                            <label style={{ fontSize: 11, color: "var(--red)", display: "block", marginBottom: 2 }}>
                              * 제품색상
                            </label>
                            <input
                              value={item.color}
                              onChange={(e) => updateItem(item.uid, "color", e.target.value)}
                              placeholder="예: 화이트"
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: 11, color: "var(--text2)", display: "block", marginBottom: 2 }}>
                              수량
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={99}
                              value={item.qty}
                              onChange={(e) =>
                                updateItem(item.uid, "qty", Number(e.target.value || 1))
                              }
                              style={{ width: 56, textAlign: "center" }}
                            />
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                            alignItems: "flex-end",
                            paddingTop: 8,
                            borderTop: "1px dashed #e5e7eb",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 110 }}>
                            <label style={{ fontSize: 11, color: "var(--red)", display: "block", marginBottom: 2 }}>
                              * 🔧 관리방법
                            </label>
                            <input
                              value={item.managementType}
                              onChange={(e) => updateItem(item.uid, "managementType", e.target.value)}
                              placeholder="방문 또는 셀프 등"
                            />
                          </div>

                          <div style={{ flex: 1, minWidth: 120 }}>
                            <label style={{ fontSize: 11, color: "var(--red)", display: "block", marginBottom: 2 }}>
                              * 🎁 프로모션
                            </label>
                            <input
                              value={item.promotion}
                              onChange={(e) => updateItem(item.uid, "promotion", e.target.value)}
                              placeholder="없음, 반값할인 등"
                            />
                          </div>

                          <div style={{ flex: 1, minWidth: 100 }}>
                            <label style={{ fontSize: 11, color: "var(--red)", display: "block", marginBottom: 2 }}>
                              * 📅 약정기간
                            </label>
                            <input
                              value={item.contractPeriod}
                              onChange={(e) => updateItem(item.uid, "contractPeriod", e.target.value)}
                              placeholder="예: 60개월"
                            />
                          </div>

                          <div style={{ flex: 1, minWidth: 100 }}>
                            <label style={{ fontSize: 11, color: "var(--red)", display: "block", marginBottom: 2 }}>
                              * 💰 렌탈료
                            </label>
                            <input
                              value={item.rentalFee}
                              onChange={(e) => updateItem(item.uid, "rentalFee", e.target.value)}
                              placeholder="예: 39,000원"
                            />
                          </div>
                        </div>

                        {item.brandId === "etc" && (
                          <div style={{ width: "100%", marginTop: 8, paddingTop: 8, borderTop: "1px dashed #e5e7eb" }}>
                            <label style={{ fontSize: 11, color: "var(--text2)", display: "block", marginBottom: 2 }}>
                              🏷️ 브랜드명 <span className="req">*</span>
                            </label>
                            <input
                              value={item.customBrand}
                              onChange={(e) => updateItem(item.uid, "customBrand", e.target.value)}
                              placeholder="브랜드명 직접 입력"
                              style={{ maxWidth: 180 }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div className="flex-end">
              <button className="btn btn-primary btn-lg" type="button" onClick={() => goStep(2)}>
                다음 단계 →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="card">
              <div className="card-header">👤 2단계: 고객정보입력</div>
              <div className="card-body">
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--blue2)",
                    marginBottom: 10,
                    paddingBottom: 6,
                    borderBottom: "2px solid var(--blue2)",
                  }}
                >
                  👤 고객 기본 정보
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <span className="req">*</span> 고객명
                    </label>
                    <input value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="홍길동" />
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="req">*</span> 주민등록번호 앞자리
                    </label>
                    <input
                      value={resnumFront}
                      maxLength={6}
                      onChange={(e) => setResnumFront(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      inputMode="numeric"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="req">*</span> 성별
                    </label>
                    <select value={custGender} onChange={(e) => setCustGender(e.target.value)}>
                      <option value="">선택</option>
                      <option>남성</option>
                      <option>여성</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <span className="req">*</span> 휴대폰
                    </label>
                    <input
                      value={custPhone}
                      onChange={(e) => setCustPhone(formatPhone(e.target.value))}
                      placeholder="010-0000-0000"
                      inputMode="numeric"
                    />
                  </div>

                  <div className="form-group">
                    <label>이메일</label>
                    <input
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full">
                    <label>
                      <span className="req">*</span> 설치 주소
                    </label>

                    <div className="input-group" style={{ marginBottom: 6 }}>
                      <input
                        value={custZip}
                        onChange={(e) => setCustZip(e.target.value)}
                        placeholder="우편번호"
                        style={{ maxWidth: 120 }}
                        readOnly
                      />
                    <button className="btn btn-yellow btn-sm" type="button" onClick={openAddrSearch}>
                      🔍 주소검색
                    </button>
                    </div>

                    <input
                      value={custAddr1}
                      onChange={(e) => setCustAddr1(e.target.value)}
                      placeholder="기본 주소"
                      style={{ marginBottom: 6 }}
                      readOnly
                    />
                    <input
                      value={custAddr2}
                      onChange={(e) => setCustAddr2(e.target.value)}
                      placeholder="상세 주소 입력 (동/호수 등)"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full">
                    <label>희망 설치일</label>
                    <input
                      type="date"
                      value={custInstallDate}
                      onChange={(e) => setCustInstallDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full">
                    <label>요청사항</label>
                    <textarea
                      value={custMemo}
                      onChange={(e) => setCustMemo(e.target.value)}
                      placeholder="설치 관련 요청사항이 있으시면 입력해 주세요."
                    />
                  </div>
                </div>

                <div className="divider"></div>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--blue2)",
                    marginBottom: 10,
                    paddingBottom: 6,
                    borderBottom: "2px solid var(--blue2)",
                  }}
                >
                  💳 결제 정보
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <span className="req">*</span> 결제 방법
                    </label>
                    <select
                      value={rentPay}
                      onChange={(e) => setRentPay(e.target.value as "은행" | "신용카드" | "기타")}
                    >
                      <option value="은행">은행</option>
                      <option value="신용카드">신용카드</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>납부일</label>
                    <select value={rentDay} onChange={(e) => setRentDay(e.target.value)}>
                      <option>5일</option>
                      <option>10일</option>
                      <option>15일</option>
                      <option>20일</option>
                      <option>25일</option>
                    </select>
                  </div>
                </div>

                {rentPay === "은행" && (
                  <div className="pay-detail-box">
                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          <span className="req">*</span> 은행명
                        </label>
                        <input
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="예: 국민은행"
                        />
                      </div>

                      <div className="form-group w2">
                        <label>
                          <span className="req">*</span> 계좌번호
                        </label>
                        <input
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                          placeholder="계좌번호 입력"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {rentPay === "신용카드" && (
                  <div className="pay-detail-box">
                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          <span className="req">*</span> 카드사
                        </label>
                        <input
                          value={cardCompany}
                          onChange={(e) => setCardCompany(e.target.value)}
                          placeholder="카드사명 직접 입력 (예: 삼성카드)"
                        />
                      </div>

                      <div className="form-group w2">
                        <label>
                          <span className="req">*</span> 카드번호
                        </label>
                        <input
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCard(e.target.value))}
                          placeholder="0000-0000-0000-0000"
                          maxLength={19}
                          inputMode="numeric"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group" style={{ maxWidth: 200 }}>
                        <label>유효기간 (MM/YY)</label>
                        <input
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          maxLength={5}
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {rentPay === "기타" && (
                  <div className="pay-detail-box">
                    <div className="form-group">
                      <label>비고</label>
                      <textarea
                        value={payEtcMemo}
                        onChange={(e) => setPayEtcMemo(e.target.value)}
                        placeholder="결제 방법 관련 내용을 입력해 주세요."
                      />
                    </div>
                  </div>
                )}

                <div className="divider"></div>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--blue2)",
                    marginBottom: 10,
                    paddingBottom: 6,
                    borderBottom: "2px solid var(--blue2)",
                  }}
                >
                  📋 기타 정보
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>영업 담당자</label>
                    <input
                      value={rentAgent}
                      onChange={(e) => setRentAgent(e.target.value)}
                      placeholder="담당자명"
                    />
                  </div>

                  <div className="form-group">
                    <label>접수 채널</label>
                    <select value={rentChannel} onChange={(e) => setRentChannel(e.target.value)}>
                      <option>방문영업</option>
                      <option>전화접수</option>
                      <option>인터넷</option>
                      <option>SNS</option>
                      <option>소개</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>고객 유형</label>
                    <select
                      value={rentCtype}
                      onChange={(e) => setRentCtype(e.target.value as "개인" | "사업자" | "기타")}
                    >
                      <option>개인</option>
                      <option>사업자</option>
                      <option>기타</option>
                    </select>
                  </div>
                </div>

                {rentCtype === "사업자" ? (
                  <div className="pay-detail-box" style={{ marginTop: 2 }}>
                    <div className="section-title" style={{ fontSize: 13 }}>📎 사업자 서류 첨부</div>

                    <div className="form-group full" style={{ marginBottom: 10 }}>
                      <label>사업자 등록 서류</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={(e) => setBizFiles(fileNames(e))}
                      />
                      {renderFileTags(bizFiles)}
                    </div>

                    <div className="form-group full">
                      <label>기타 서류 첨부</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={(e) => setEtcFiles(fileNames(e))}
                      />
                      {renderFileTags(etcFiles)}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 8 }}>
                    <div className="form-group full">
                      <label>📎 기타 서류 첨부</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={(e) => setPersonalEtcFiles(fileNames(e))}
                      />
                      {renderFileTags(personalEtcFiles)}
                    </div>
                  </div>
                )}

                <div className="mt16">
                  <div className="section-title">선택 제품 요약</div>
                  <div className="summary-box">
                    {!selectedItems.length ? (
                      <div style={{ color: "var(--gray)", fontSize: 13 }}>선택된 제품이 없습니다.</div>
                    ) : (
                      <>
                        {selectedItems.map((item) => {
                          const brandDisplay =
                            item.brandId === "etc" && item.customBrand
                              ? item.customBrand
                              : item.brandName;

                          return (
                            <div key={item.uid} className="summary-row">
                              <span>
                                <b style={{ color: item.brandColor }}>{brandDisplay}</b> {item.category}
                                {item.productName ? ` · ${item.productName}` : ""}
                                {item.modelName ? ` [${item.modelName}]` : ""}
                                {item.managementType ? (
                                  <span
                                    style={{
                                      background: "#e0f2fe",
                                      color: "#0369a1",
                                      borderRadius: 4,
                                      padding: "1px 6px",
                                      fontSize: 11,
                                      marginLeft: 4,
                                    }}
                                  >
                                    {item.managementType}
                                  </span>
                                ) : null}
                                {item.promotion ? (
                                  <span
                                    style={{
                                      background: "#fef3c7",
                                      color: "#b45309",
                                      borderRadius: 4,
                                      padding: "1px 6px",
                                      fontSize: 11,
                                      marginLeft: 4,
                                    }}
                                  >
                                    {item.promotion}
                                  </span>
                                ) : null}
                                {item.contractPeriod ? (
                                  <span
                                    style={{
                                      background: "#f0fdf4",
                                      color: "#166534",
                                      borderRadius: 4,
                                      padding: "1px 6px",
                                      fontSize: 11,
                                      marginLeft: 4,
                                    }}
                                  >
                                    📅{item.contractPeriod}
                                  </span>
                                ) : null}
                                {item.rentalFee ? (
                                  <span
                                    style={{
                                      background: "#fdf4ff",
                                      color: "#7e22ce",
                                      borderRadius: 4,
                                      padding: "1px 6px",
                                      fontSize: 11,
                                      marginLeft: 4,
                                    }}
                                  >
                                    💰{item.rentalFee}
                                  </span>
                                ) : null}
                              </span>
                              <span style={{ color: "var(--text2)", fontSize: 12 }}>
                                {item.color || "색상 미입력"} / {item.qty}개
                              </span>
                            </div>
                          );
                        })}

                        <div className="summary-row">
                          <span>📦 총 {totalQty}개</span>
                          <span style={{ color: "var(--blue2)", fontWeight: 700 }}>
                            {selectedItems.length}종 선택
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-end">
              <button className="btn btn-gray" type="button" onClick={() => goStep(1)}>
                ← 이전
              </button>
              <button className="btn btn-primary btn-lg" type="button" onClick={() => goStep(3)}>
                확인/제출 →
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="card">
              <div className="card-header">✅ 3단계: 최종 확인 및 제출</div>
              <div className="card-body">
                <div className="alert alert-info">입력하신 내용을 확인해 주세요.</div>

                <table style={{ width: "100%", fontSize: 13, marginBottom: 14, borderCollapse: "collapse" }}>
                  <tbody>
                    <tr style={{ background: "#f0f5ff" }}>
                      <td colSpan={2} style={{ padding: "8px 10px", fontWeight: 700, color: "var(--blue2)" }}>
                        고객 정보
                      </td>
                    </tr>

                    <tr>
                      <td style={{ padding: "7px 10px", color: "var(--gray)", width: 110 }}>고객명</td>
                      <td style={{ padding: "7px 10px" }}>{custName}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "7px 10px", color: "var(--gray)" }}>주민번호 앞자리</td>
                      <td style={{ padding: "7px 10px", fontFamily: "monospace" }}>{resnumFront || "미입력"}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "7px 10px", color: "var(--gray)" }}>성별</td>
                      <td style={{ padding: "7px 10px" }}>{custGender || "-"}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "7px 10px", color: "var(--gray)" }}>휴대폰</td>
                      <td style={{ padding: "7px 10px" }}>{custPhone}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "7px 10px", color: "var(--gray)" }}>설치주소</td>
                      <td style={{ padding: "7px 10px" }}>{`${custAddr1} ${custAddr2}`.trim()}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "7px 10px", color: "var(--gray)" }}>고객유형</td>
                      <td style={{ padding: "7px 10px" }}>{rentCtype}</td>
                    </tr>

                    <tr style={{ background: "#f0f5ff" }}>
                      <td colSpan={2} style={{ padding: "8px 10px", fontWeight: 700, color: "var(--blue2)" }}>
                        렌탈 제품 ({selectedItems.length}종)
                      </td>
                    </tr>

                    {selectedItems.map((item) => {
                      const brandDisplay =
                        item.brandId === "etc" && item.customBrand
                          ? item.customBrand
                          : item.brandName;

                      return (
                        <tr key={item.uid}>
                          <td
                            style={{
                              padding: "7px 10px",
                              color: "var(--gray)",
                              verticalAlign: "top",
                            }}
                          >
                            <b style={{ color: item.brandColor }}>{brandDisplay}</b>
                            <br />
                            {item.category}
                          </td>
                          <td style={{ padding: "7px 10px", fontSize: 12, lineHeight: 1.8 }}>
                            제품명: {item.productName || "-"} / 모델: {item.modelName || "-"}
                            <br />
                            색상: {item.color || "-"} / 수량: {item.qty}개
                            <br />
                            관리: {item.managementType || "-"} / 프로모션: {item.promotion || "-"}
                            <br />
                            약정기간: {item.contractPeriod || "-"} / 렌탈료: {item.rentalFee || "-"}
                          </td>
                        </tr>
                      );
                    })}

                    <tr style={{ background: "#f0f5ff" }}>
                      <td colSpan={2} style={{ padding: "8px 10px", fontWeight: 700, color: "var(--blue2)" }}>
                        결제 정보
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "7px 10px", color: "var(--gray)" }}>결제 방법</td>
                      <td style={{ padding: "7px 10px" }}>{rentPay}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "7px 10px", color: "var(--gray)" }}>결제 정보</td>
                      <td style={{ padding: "7px 10px" }}>
                        {rentPay === "은행"
                          ? `${bankName} / ${bankAccount}`
                          : rentPay === "신용카드"
                          ? `${cardCompany} / ${cardNumber}${cardExpiry ? ` (${cardExpiry})` : ""}`
                          : `기타 - ${payEtcMemo}`}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "7px 10px", color: "var(--gray)" }}>납부일</td>
                      <td style={{ padding: "7px 10px" }}>{rentDay}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex-end">
              <button className="btn btn-gray" type="button" onClick={() => goStep(2)}>
                ← 이전
              </button>
              <button className="btn btn-success btn-lg" type="button" onClick={submitForm}>
                🚀 최종 접수
              </button>
            </div>

            {submittedNum && (
              <div className="card mt16">
                <div className="card-body">
                  <div className="success-wrap">
                    <div className="success-icon">🎉</div>
                    <div className="success-num">접수번호: {submittedNum}</div>
                    <div className="success-msg">
                      렌탈 신청이 완료되었습니다!
                      <br />
                      담당자가 확인 후 1~2 영업일 내 연락드리겠습니다.
                    </div>

                    <div className="receipt-box">
                      <div style={{ fontSize: 12, color: "var(--gray)", marginBottom: 8 }}>
                        접수일: {submittedDate}
                      </div>
                      <div style={{ fontSize: 13, marginBottom: 4 }}>
                        고객명: <strong>{custName}</strong>
                      </div>
                      <div style={{ fontSize: 13, marginBottom: 4 }}>연락처: {custPhone}</div>
                      <div style={{ fontSize: 13, marginBottom: 6 }}>
                        제품:
                        <br />
                        {submittedProducts.map((p) => (
                          <div key={p}>• {p}</div>
                        ))}
                      </div>
                      <div style={{ fontSize: 13 }}>결제: {rentPay}</div>
                    </div>

                    <div className="gap8">
                      <button className="btn btn-outline" type="button" onClick={() => window.print()}>
                        🖨️ 접수증 출력
                      </button>
                      <button className="btn btn-primary" type="button" onClick={resetForm}>
                        새 접수 작성
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

            {addrOpen && (
        <>
          <div className="addr-backdrop" onClick={closeAddrSearch}></div>

          <div className="addr-search-panel">
            <div className="addr-search-header">
              <span className="addr-search-header-title">🔍 주소 검색</span>
              <button className="addr-search-close" type="button" onClick={closeAddrSearch}>
                ✕
              </button>
            </div>

            <div className="addr-search-body">
              <div className="addr-search-row">
                <input
                  className="addr-search-input"
                  value={addrKeyword}
                  onChange={(e) => setAddrKeyword(e.target.value)}
                  placeholder="예) 명촌3길 21, 진장동 890, 강남구 테헤란로"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") doAddrSearch();
                  }}
                />
                <button className="addr-search-btn" type="button" onClick={doAddrSearch}>
                  검색
                </button>
              </div>

              <div className="addr-search-help">
                도로명+건물번호, 지역명+번지, 건물명으로 검색
              </div>
            </div>

            <div className="addr-results">
              {addrResults.length > 0 ? (
                <>
                  <div className="addr-result-meta">
                    검색결과 {addrResults.length}건 | 클릭하여 선택
                  </div>

                  {addrResults.map((item) => (
                    <div
                      key={`${item.zip}-${item.road}`}
                      className="addr-result-item"
                      onClick={() => selectAddr(item.zip, item.road)}
                    >
                      <div className="addr-zip">{item.zip}</div>

                      <div className="addr-line">
                        <span className="addr-tag-road">도로명</span>
                        <span className="addr-line-text">{item.road}</span>
                      </div>

                      <div className="addr-line">
                        <span className="addr-tag-jibun">지 번</span>
                        <span className="addr-line-text sub">{item.jibun}</span>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "32px",
                    color: "#888",
                    fontSize: "13px",
                    lineHeight: 1.8,
                  }}
                >
                  검색 결과가 없습니다.
                  <br />
                  <span style={{ fontSize: "12px", color: "#aaa" }}>
                    다른 키워드로 검색해 보세요
                  </span>
                </div>
              )}
            </div>

            <div className="addr-search-footer">도로명주소 검색 서비스</div>
          </div>
        </>
      )}
    </>
  );
}