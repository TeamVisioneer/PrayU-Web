import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";

// 스크롤바 숨기기 스타일
const hideScrollbarStyle = `
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;  /* Chrome, Safari, Opera */
  }
`;

// PDF 생성용 스타일
const pdfStyle = `
  @media print {
    body {
      width: 210mm;
      height: 297mm;
      margin: 0;
      padding: 0;
    }
    .pdf-page {
      page-break-after: always;
      width: 210mm;
      min-height: 297mm;
      padding: 10mm;
      margin: 0;
      background-color: white;
    }
    .pdf-content {
      font-size: 12pt;
    }
    .pdf-header {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 10mm;
    }
  }
`;

// 목데이터 타입
interface GroupMember {
  id: string;
  name: string;
  role: string;
  profileImage?: string;
  lastActive: string;
}

interface DailyShare {
  id: string;
  memberId: string;
  memberName: string;
  content: string;
  date: string;
}

interface PrayerRequest {
  id: string;
  memberId: string;
  memberName: string;
  title: string;
  content: string;
  date: string;
  prayCount: number;
}

/* 기도기록 통계 - 주석처리
interface GroupStats {
  weeklyPrayerCount: number;
  totalPrayerCards: number;
  activeMembers: number;
  totalPrayerTime: string;
}
*/

interface GroupStats {
  weeklyPrayerCount: number;
  totalPrayerCards: number;
  activeMembers: number;
  totalPrayerTime: string;
}

// 멤버별 콘텐츠를 합치기 위한 인터페이스
interface MemberContent {
  memberId: string;
  memberName: string;
  role: string;
  dailyShares: DailyShare[];
  prayerRequests: PrayerRequest[];
}

const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string; unionId: string }>();
  // URL에 unionId도 포함되어 있지만 현재 컴포넌트에서는 사용하지 않음
  const navigate = useNavigate();
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState("");
  const [groupLeader, setGroupLeader] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [dailyShares, setDailyShares] = useState<DailyShare[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [memberContents, setMemberContents] = useState<MemberContent[]>([]);
  const [stats, setStats] = useState<GroupStats>({
    weeklyPrayerCount: 0,
    totalPrayerCards: 0,
    activeMembers: 0,
    totalPrayerTime: "",
  });

  // 어떤 멤버의 카드가 펼쳐져 있는지 추적하는 상태
  const [expandedMembers, setExpandedMembers] = useState<
    Record<string, boolean>
  >({});

  // 멤버 펼치기/접기 처리 함수
  const toggleMemberExpand = (memberId: string) => {
    // 현재 스크롤 위치 저장
    const scrollPosition = window.scrollY;

    setExpandedMembers((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));

    // 스크롤 위치 복원
    setTimeout(() => {
      window.scrollTo({
        top: scrollPosition,
        behavior: "auto",
      });
    }, 0);
  };

  // PDF 저장 처리 함수
  // const handleSavePDF = async () => {
  //   try {
  //     // PDF 생성 준비 중임을 알림
  //     alert("PDF를 생성하는 중입니다. 잠시만 기다려주세요.");

  //     // 문서 내용이 있는 div 요소 선택
  //     const pdfContent = pdfContentRef.current;
  //     if (!pdfContent) {
  //       throw new Error("PDF 내용을 찾을 수 없습니다.");
  //     }

  //     // PDF용 A4 크기 임시 컨테이너 생성
  //     const pdfContainer = document.createElement("div");
  //     pdfContainer.className = "pdf-container";
  //     pdfContainer.style.width = "210mm";
  //     pdfContainer.style.margin = "0 auto";
  //     pdfContainer.style.background = "white";
  //     pdfContainer.style.boxSizing = "border-box";
  //     pdfContainer.style.fontFamily = "Pretendard, sans-serif";
  //     pdfContainer.style.padding = "25mm 20mm";
  //     document.body.appendChild(pdfContainer);

  //     // PDF 헤더 영역 생성
  //     const headerDiv = document.createElement("div");
  //     headerDiv.style.textAlign = "center";
  //     headerDiv.style.marginBottom = "15mm";

  //     // 그룹명 추가
  //     const titleEl = document.createElement("h1");
  //     titleEl.textContent = groupName;
  //     titleEl.style.fontSize = "28px";
  //     titleEl.style.fontWeight = "bold";
  //     titleEl.style.marginBottom = "8mm";
  //     headerDiv.appendChild(titleEl);

  //     // 그룹 설명 추가
  //     if (groupDescription) {
  //       const descEl = document.createElement("p");
  //       descEl.textContent = groupDescription;
  //       descEl.style.fontSize = "14px";
  //       descEl.style.color = "#666";
  //       headerDiv.appendChild(descEl);
  //     }

  //     pdfContainer.appendChild(headerDiv);

  //     // 통계 영역 추가
  //     const statsDiv = document.createElement("div");
  //     statsDiv.style.marginBottom = "10mm";

  //     // 통계 제목
  //     const statsTitleEl = document.createElement("h2");
  //     statsTitleEl.textContent = "그룹 현황";
  //     statsTitleEl.style.fontSize = "18px";
  //     statsTitleEl.style.fontWeight = "bold";
  //     statsTitleEl.style.marginBottom = "5mm";
  //     statsDiv.appendChild(statsTitleEl);

  //     // 통계 카드 컨테이너
  //     const statsCardsDiv = document.createElement("div");
  //     statsCardsDiv.style.display = "flex";
  //     statsCardsDiv.style.justifyContent = "space-between";
  //     statsCardsDiv.style.gap = "10px";

  //     // 통계 카드 생성 함수
  //     const createStatCard = (title: string, value: string, color: string) => {
  //       const cardDiv = document.createElement("div");
  //       cardDiv.style.flex = "1";
  //       cardDiv.style.backgroundColor = "#f9f9f9";
  //       cardDiv.style.border = "1px solid #eee";
  //       cardDiv.style.borderRadius = "5px";
  //       cardDiv.style.padding = "15px";
  //       cardDiv.style.textAlign = "center";

  //       const valueEl = document.createElement("div");
  //       valueEl.textContent = value;
  //       valueEl.style.fontSize = "24px";
  //       valueEl.style.fontWeight = "bold";
  //       valueEl.style.color = color;
  //       valueEl.style.marginBottom = "5px";
  //       cardDiv.appendChild(valueEl);

  //       const titleEl = document.createElement("div");
  //       titleEl.textContent = title;
  //       titleEl.style.fontSize = "14px";
  //       titleEl.style.color = "#666";
  //       cardDiv.appendChild(titleEl);

  //       return cardDiv;
  //     };

  //     // 통계 카드 추가
  //     statsCardsDiv.appendChild(
  //       createStatCard(
  //         "오늘 기도",
  //         `${Math.round(stats.weeklyPrayerCount / 7)}개`,
  //         "#1a73e8"
  //       )
  //     );
  //     statsCardsDiv.appendChild(
  //       createStatCard(
  //         "이번 주 기도",
  //         `${stats.weeklyPrayerCount}개`,
  //         "#1a73e8"
  //       )
  //     );
  //     statsCardsDiv.appendChild(
  //       createStatCard("누적 기도", `${stats.totalPrayerCards}개`, "#1a73e8")
  //     );

  //     statsDiv.appendChild(statsCardsDiv);
  //     pdfContainer.appendChild(statsDiv);

  //     // 멤버별 기도카드 영역 추가
  //     const cardsDiv = document.createElement("div");
  //     cardsDiv.style.marginBottom = "10mm";

  //     // 기도카드 제목
  //     const cardsTitleEl = document.createElement("h2");
  //     cardsTitleEl.textContent = "멤버별 기도카드";
  //     cardsTitleEl.style.fontSize = "18px";
  //     cardsTitleEl.style.fontWeight = "bold";
  //     cardsTitleEl.style.marginBottom = "5mm";
  //     cardsDiv.appendChild(cardsTitleEl);

  //     // 각 멤버별 컨텐츠 추가
  //     for (const memberContent of memberContents) {
  //       // 멤버 영역 생성
  //       const memberDiv = document.createElement("div");
  //       memberDiv.style.marginBottom = "22px";
  //       memberDiv.style.breakInside = "avoid";
  //       memberDiv.className = "member-card";

  //       // 멤버 헤더
  //       const memberHeaderDiv = document.createElement("div");
  //       memberHeaderDiv.style.backgroundColor = "#f8f9fa";
  //       memberHeaderDiv.style.padding = "12px 16px";
  //       memberHeaderDiv.style.borderRadius = "8px";
  //       memberHeaderDiv.style.marginBottom = "12px";
  //       memberHeaderDiv.style.display = "flex";
  //       memberHeaderDiv.style.alignItems = "center";
  //       memberHeaderDiv.style.borderLeft = "3px solid #4caf50";

  //       // 멤버 이름
  //       const memberNameEl = document.createElement("div");
  //       memberNameEl.textContent = memberContent.memberName;
  //       memberNameEl.style.fontWeight = "bold";
  //       memberNameEl.style.fontSize = "16px";
  //       memberNameEl.style.marginRight = "12px";
  //       memberHeaderDiv.appendChild(memberNameEl);

  //       // 멤버 역할
  //       const roleEl = document.createElement("span");
  //       roleEl.textContent = memberContent.role;
  //       roleEl.style.fontSize = "12px";
  //       roleEl.style.padding = "3px 10px";
  //       roleEl.style.borderRadius = "100px";
  //       roleEl.style.display = "inline-block";
  //       roleEl.style.lineHeight = "1.5";
  //       roleEl.style.fontWeight = "500";

  //       if (memberContent.role === "그룹장") {
  //         roleEl.style.backgroundColor = "#e8f5e9";
  //         roleEl.style.color = "#2e7d32";
  //         roleEl.style.border = "1px solid #c8e6c9";
  //       } else {
  //         roleEl.style.backgroundColor = "#f5f5f5";
  //         roleEl.style.color = "#616161";
  //         roleEl.style.border = "1px solid #e0e0e0";
  //       }

  //       memberHeaderDiv.appendChild(roleEl);
  //       memberDiv.appendChild(memberHeaderDiv);

  //       // 기도 카드 데이터 준비
  //       const prayerCards = [];

  //       // 일상 나눔과 기도 제목 페어링
  //       for (let i = 0; i < memberContent.dailyShares.length; i++) {
  //         const share = memberContent.dailyShares[i];
  //         const prayer = memberContent.prayerRequests[i] || null;
  //         prayerCards.push({ share, prayer });
  //       }

  //       // 기도 제목만 있는 경우
  //       for (
  //         let i = memberContent.dailyShares.length;
  //         i < memberContent.prayerRequests.length;
  //         i++
  //       ) {
  //         prayerCards.push({
  //           share: null,
  //           prayer: memberContent.prayerRequests[i],
  //         });
  //       }

  //       if (prayerCards.length === 0) {
  //         // 기도 카드가 없는 경우
  //         const noCardEl = document.createElement("div");
  //         noCardEl.textContent = "아직 작성된 기도카드가 없습니다.";
  //         noCardEl.style.color = "#999";
  //         noCardEl.style.fontStyle = "italic";
  //         noCardEl.style.textAlign = "center";
  //         noCardEl.style.padding = "15px";
  //         memberDiv.appendChild(noCardEl);
  //       } else {
  //         // 각 카드 내용 추가
  //         for (const card of prayerCards) {
  //           const cardDiv = document.createElement("div");
  //           cardDiv.style.backgroundColor = "#f9f9f9";
  //           cardDiv.style.borderRadius = "5px";
  //           cardDiv.style.marginBottom = "10px";
  //           cardDiv.style.position = "relative";
  //           cardDiv.style.breakInside = "avoid";
  //           cardDiv.style.borderLeft = "3px solid #4caf50";
  //           cardDiv.style.padding = "12px 15px";

  //           // 일상 나눔
  //           if (card.share) {
  //             const shareDiv = document.createElement("div");
  //             shareDiv.style.marginBottom = card.prayer ? "10px" : "0";

  //             const shareTitle = document.createElement("div");
  //             shareTitle.textContent = "일상 나눔";
  //             shareTitle.style.fontWeight = "bold";
  //             shareTitle.style.marginBottom = "5px";
  //             shareTitle.style.fontSize = "14px";
  //             shareDiv.appendChild(shareTitle);

  //             const shareContent = document.createElement("div");
  //             shareContent.textContent = card.share.content;
  //             shareContent.style.fontSize = "13px";
  //             shareDiv.appendChild(shareContent);

  //             cardDiv.appendChild(shareDiv);

  //             // 구분선 (기도 제목이 있는 경우)
  //             if (card.prayer) {
  //               const divider = document.createElement("hr");
  //               divider.style.margin = "8px 0";
  //               divider.style.border = "none";
  //               divider.style.borderBottom = "1px solid #eee";
  //               cardDiv.appendChild(divider);
  //             }
  //           }

  //           // 기도 제목
  //           if (card.prayer) {
  //             const prayerDiv = document.createElement("div");

  //             const prayerTitle = document.createElement("div");
  //             prayerTitle.textContent = "기도 제목";
  //             prayerTitle.style.fontWeight = "bold";
  //             prayerTitle.style.marginBottom = "5px";
  //             prayerTitle.style.fontSize = "14px";
  //             prayerDiv.appendChild(prayerTitle);

  //             const prayerContent = document.createElement("div");
  //             prayerContent.textContent = card.prayer.content;
  //             prayerContent.style.fontSize = "13px";
  //             prayerDiv.appendChild(prayerContent);

  //             cardDiv.appendChild(prayerDiv);
  //           }

  //           // 카드 푸터 (날짜 및 기도 횟수)
  //           const cardFooter = document.createElement("div");
  //           cardFooter.style.marginTop = "10px";
  //           cardFooter.style.display = "flex";
  //           cardFooter.style.justifyContent = "space-between";
  //           cardFooter.style.borderTop = "1px solid #eee";
  //           cardFooter.style.paddingTop = "8px";
  //           cardFooter.style.fontSize = "11px";
  //           cardFooter.style.color = "#999";

  //           const dateSpan = document.createElement("span");
  //           dateSpan.textContent = card.share
  //             ? card.share.date
  //             : card.prayer.date;
  //           cardFooter.appendChild(dateSpan);

  //           const prayCountSpan = document.createElement("span");
  //           const prayCount = card.prayer ? card.prayer.prayCount : 0;
  //           prayCountSpan.textContent = `${prayCount}명과 함께 기도`;
  //           cardFooter.appendChild(prayCountSpan);

  //           cardDiv.appendChild(cardFooter);
  //           memberDiv.appendChild(cardDiv);
  //         }
  //       }

  //       cardsDiv.appendChild(memberDiv);
  //     }

  //     pdfContainer.appendChild(cardsDiv);

  //     // 푸터 추가
  //     const footerDiv = document.createElement("div");
  //     footerDiv.style.textAlign = "center";
  //     footerDiv.style.color = "#757575";
  //     footerDiv.style.fontSize = "11px";
  //     footerDiv.style.marginTop = "25mm";
  //     footerDiv.style.paddingBottom = "10mm";
  //     footerDiv.textContent = `PrayU - ${groupName} 그룹정보 - ${new Date().toLocaleDateString()}`;
  //     pdfContainer.appendChild(footerDiv);

  //     // jsPDF 인스턴스 생성
  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "mm",
  //       format: "a4",
  //     });

  //     // PDF 변환 및 저장
  //     try {
  //       // 생성한 HTML을 캔버스로 변환
  //       const canvas = await html2canvas(pdfContainer, {
  //         scale: 2,
  //         useCORS: true,
  //         allowTaint: true,
  //         logging: false,
  //       });

  //       // 캔버스를 이미지로 변환하여 PDF에 추가
  //       const imgData = canvas.toDataURL("image/jpeg", 0.95);
  //       const imgWidth = 210;
  //       const pageHeight = 297;
  //       const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //       let heightLeft = imgHeight;
  //       let position = 0;

  //       // 첫 페이지 추가
  //       doc.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  //       heightLeft -= pageHeight;

  //       // 필요한 경우 추가 페이지 생성
  //       while (heightLeft >= 0) {
  //         position = heightLeft - imgHeight;
  //         doc.addPage();
  //         doc.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  //         heightLeft -= pageHeight;
  //       }

  //       // PDF 저장
  //       doc.save(`${groupName}_그룹정보.pdf`);
  //     } catch (err) {
  //       console.error("PDF 이미지 생성 오류:", err);
  //       const errorMessage =
  //         err instanceof Error ? err.message : "알 수 없는 오류";
  //       throw new Error("PDF 변환 실패: " + errorMessage);
  //     } finally {
  //       // 임시 컨테이너 제거
  //       if (pdfContainer && pdfContainer.parentNode) {
  //         pdfContainer.parentNode.removeChild(pdfContainer);
  //       }
  //     }
  //   } catch (err) {
  //     console.error("PDF 생성 중 오류 발생:", err);
  //     const errorMessage =
  //       err instanceof Error ? err.message : "알 수 없는 오류";
  //     alert("PDF 생성 중 오류가 발생했습니다: " + errorMessage);
  //   }
  // };

  useEffect(() => {
    if (groupId) {
      // 실제로는 API 호출로 대체됩니다
      // 목데이터 생성
      setGroupName(`소그룹 ${groupId.split("-")[1]}`);
      setGroupLeader(`리더 ${Math.floor(Math.random() * 5) + 1}`);
      setGroupDescription(
        `이 그룹은 ${Math.random() > 0.5 ? "성경공부" : "기도모임"} 그룹입니다.`
      );

      // 멤버 목데이터
      const mockMembers: GroupMember[] = Array.from(
        { length: Math.floor(Math.random() * 10) + 5 },
        (_, i) => ({
          id: `member-${i + 1}`,
          name: `멤버 ${i + 1}`,
          role: i === 0 ? "그룹장" : "멤버",
          lastActive: new Date(
            Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split("T")[0],
        })
      );
      setMembers(mockMembers);

      // 일상 나눔 목데이터
      const mockDailyShares: DailyShare[] = Array.from(
        { length: 30 },
        (_, i) => {
          const memberIndex = Math.floor(Math.random() * mockMembers.length);
          const daysAgo = Math.floor(Math.random() * 14);
          const date = new Date();
          date.setDate(date.getDate() - daysAgo);

          return {
            id: `share-${i + 1}`,
            memberId: mockMembers[memberIndex].id,
            memberName: mockMembers[memberIndex].name,
            content: `오늘은 ${
              [
                "좋은 하루",
                "힘든 하루",
                "보람찬 하루",
                "기쁜 하루",
                "감사한 하루",
              ][i % 5]
            }였습니다. ${
              ["가족과 함께", "교회에서", "직장에서", "친구와 함께", "혼자서"][
                i % 5
              ]
            } 시간을 보냈습니다.`,
            date: date.toISOString().split("T")[0],
          };
        }
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setDailyShares(mockDailyShares);

      // 기도제목 목데이터
      const mockPrayerRequests: PrayerRequest[] = Array.from(
        { length: 25 },
        (_, i) => {
          const memberIndex = Math.floor(Math.random() * mockMembers.length);
          const daysAgo = Math.floor(Math.random() * 14);
          const date = new Date();
          date.setDate(date.getDate() - daysAgo);

          const prayerTopics = [
            "가족의 건강을 위해",
            "직장에서의 지혜를 위해",
            "교회와 성도들을 위해",
            "자녀의 학업을 위해",
            "영적 성장을 위해",
            "사업의 축복을 위해",
          ];

          return {
            id: `prayer-${i + 1}`,
            memberId: mockMembers[memberIndex].id,
            memberName: mockMembers[memberIndex].name,
            title: prayerTopics[i % prayerTopics.length],
            content: `${prayerTopics[i % prayerTopics.length]} 기도합니다. ${
              [
                "하나님의 은혜를 구합니다.",
                "주님의 인도하심을 원합니다.",
                "하나님의 축복을 구합니다.",
                "성령님의 도우심을 구합니다.",
              ][i % 4]
            }`,
            date: date.toISOString().split("T")[0],
            prayCount: Math.floor(Math.random() * 20) + 1,
          };
        }
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPrayerRequests(mockPrayerRequests);

      // 통계 목데이터
      setStats({
        weeklyPrayerCount: Math.floor(Math.random() * 50) + 10,
        totalPrayerCards: Math.floor(Math.random() * 100) + 20,
        activeMembers: Math.floor(mockMembers.length * 0.7),
        totalPrayerTime: `${Math.floor(Math.random() * 100) + 30}시간`,
      });

      setLoading(false);
    }
  }, [groupId]);

  // 멤버별로 컨텐츠 정리하기
  useEffect(() => {
    if (!loading) {
      const memberMap = new Map<string, MemberContent>();

      // 멤버 정보 초기화
      members.forEach((member) => {
        memberMap.set(member.id, {
          memberId: member.id,
          memberName: member.name,
          role: member.role,
          dailyShares: [],
          prayerRequests: [],
        });
      });

      // 일상 나눔 데이터 추가
      dailyShares.forEach((share) => {
        const memberContent = memberMap.get(share.memberId);
        if (memberContent) {
          memberContent.dailyShares.push(share);
        }
      });

      // 기도 제목 데이터 추가
      prayerRequests.forEach((prayer) => {
        const memberContent = memberMap.get(prayer.memberId);
        if (memberContent) {
          memberContent.prayerRequests.push(prayer);
        }
      });

      // 데이터가 있는 멤버만 필터링하고 정렬
      const sortedMemberContents = Array.from(memberMap.values())
        .filter(
          (content) =>
            content.dailyShares.length > 0 || content.prayerRequests.length > 0
        )
        .sort((a, b) => {
          // 그룹장을 맨 위로, 나머지는 이름 알파벳 순
          if (a.role === "그룹장") return -1;
          if (b.role === "그룹장") return 1;
          return a.memberName.localeCompare(b.memberName);
        });

      setMemberContents(sortedMemberContents);
    }
  }, [loading, members, dailyShares, prayerRequests]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 print:bg-white print:pb-10"
      ref={pdfContentRef}
    >
      {/* CSS for hiding scrollbars */}
      <style>{hideScrollbarStyle}</style>
      {/* CSS for PDF formatting */}
      <style>{pdfStyle}</style>

      {/* 인쇄 시 숨길 요소에 대한 스타일 */}
      <style>{`
        @media print {
          .no-print { 
            display: none !important; 
          }
          .print-container {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
          }
          body {
            font-size: 12pt;
            line-height: 1.5;
            margin: 0;
            padding: 0;
          }
          h1 { font-size: 18pt; }
          h2 { font-size: 16pt; }
          h3 { font-size: 14pt; }
          
          /* PDF 여러 페이지로 나누기 */
          .member-card {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* PDF 헤더/푸터 제어 */
          @page {
            size: A4;
            margin: 1cm;
          }
          
          /* 브라우저가 자동으로 생성하는 헤더 푸터 제거 */
          @page {
            margin-top: 1cm;
            margin-bottom: 2cm;
          }
          
          /* 푸터에 PrayU 추가 */
          .pdf-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-weight: bold;
            padding: 10px;
            font-size: 14pt;
          }
        }
      `}</style>

      {/* 상단 헤더 */}
      <div className="sticky top-0 z-30 no-print">
        {/* 상단 헤더 */}
        <div className="bg-green-700 text-white border-b border-green-800 p-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-3 text-white hover:text-green-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-lg font-bold">{groupName}</h1>
          </div>
          {/* <button
            onClick={handleSavePDF}
            className="flex items-center text-sm bg-green-600 hover:bg-green-800 rounded-md px-3 py-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            PDF로 저장하기
          </button> */}
        </div>

        {/* 그룹 정보 */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center mr-4 bg-green-100 text-green-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-gray-900">
                    {groupName}
                  </h2>
                  <div className="flex flex-wrap items-center text-sm mt-1">
                    <span className="font-medium text-gray-700">
                      그룹장: {groupLeader}
                    </span>
                    {groupDescription && (
                      <>
                        <span className="mx-1.5 text-gray-400">•</span>
                        <span className="text-gray-600">
                          {groupDescription}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 그룹 통계 카드 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 print:px-0 print:py-2">
        {/* 섹션 타이틀 - 그룹현황 */}
        <h2 className="text-lg font-medium text-gray-900 mb-4">그룹현황</h2>

        {/* 그룹 통계 지표 - 3개 지표를 가로로 배치 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 print:border print:border-gray-300 print:shadow-none print:mb-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                오늘 기도
              </h3>
              <p className="text-xl md:text-2xl font-bold">
                {Math.round(stats.weeklyPrayerCount / 7)}개
              </p>
              <p className="text-xs md:text-sm text-blue-600 mt-1">
                전체의 {Math.round((stats.activeMembers / members.length) * 40)}
                % 참여
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                이번 주 기도
              </h3>
              <p className="text-xl md:text-2xl font-bold">
                {stats.weeklyPrayerCount}개
              </p>
              <p className="text-xs md:text-sm text-green-600 mt-1">
                전주 대비 {Math.floor(Math.random() * 30) + 10}% 증가
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                누적 기도
              </h3>
              <p className="text-xl md:text-2xl font-bold">
                {stats.totalPrayerCards}개
              </p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                멤버당 평균{" "}
                {Math.round(stats.totalPrayerCards / members.length)}개
              </p>
            </div>
          </div>
        </div>

        {/* 멤버별 콘텐츠 섹션 */}
        <div className="mt-6 print:mt-0">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            맴버별 기도카드
          </h2>

          {/* 멤버 리스트 */}
          <div className="space-y-2">
            {memberContents.map((memberContent) => (
              <div
                key={memberContent.memberId}
                className="bg-white rounded-lg shadow-sm border border-gray-200"
              >
                {/* 멤버 헤더 - 클릭 시 드롭다운 토글 */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleMemberExpand(memberContent.memberId)}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <span className="text-green-700 font-medium">
                        {memberContent.memberName.substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-900">
                        {memberContent.memberName}
                      </h3>
                      <span
                        className={`text-xs inline-block px-2 py-0.5 rounded-full ${
                          memberContent.role === "그룹장"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {memberContent.role === "그룹장" ? "그룹장" : "멤버"}
                      </span>
                    </div>
                  </div>

                  {/* 드롭다운 아이콘 */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      expandedMembers[memberContent.memberId]
                        ? "rotate-180"
                        : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* 멤버별 기도카드 - 드롭다운 콘텐츠 */}
                {expandedMembers[memberContent.memberId] && (
                  <div className="border-t border-gray-200 p-4">
                    {/* 기도카드 목록 */}
                    <div className="space-y-4">
                      {/* 기도카드 생성 - 일상나눔과 기도제목 맵핑하여 카드 만들기 */}
                      {memberContent.dailyShares.map((share, index) => {
                        // 해당 인덱스에 기도제목이 있는 경우에만 카드 생성
                        const prayer =
                          memberContent.prayerRequests[index] || null;

                        return (
                          <div
                            key={share.id}
                            className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm"
                          >
                            {/* 일상 나눔 */}
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                일상 나눔
                              </h4>
                              <div className="pl-3 border-l-2 border-green-200">
                                <p className="text-sm text-gray-700">
                                  {share.content}
                                </p>
                              </div>
                            </div>

                            {/* 기도 제목 */}
                            {prayer && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                  기도 제목
                                </h4>
                                <div className="pl-3 border-l-2 border-green-200">
                                  <p className="text-sm text-gray-700">
                                    {prayer.content}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* 날짜 및 함께 기도 정보 */}
                            <div className="flex items-center mt-3 text-xs text-gray-500">
                              <span>{share.date}</span>
                              <span className="mx-2 text-gray-400">•</span>
                              <span>
                                {prayer ? prayer.prayCount : 0}명과 함께 기도
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* 일상나눔이 없고 기도제목만 있는 경우 처리 */}
                      {memberContent.prayerRequests
                        .slice(memberContent.dailyShares.length)
                        .map((prayer) => (
                          <div
                            key={prayer.id}
                            className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm"
                          >
                            {/* 기도 제목 */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                기도 제목
                              </h4>
                              <div className="pl-3 border-l-2 border-green-200">
                                <p className="text-sm text-gray-700">
                                  {prayer.content}
                                </p>
                              </div>
                            </div>

                            {/* 날짜 및 함께 기도 정보 */}
                            <div className="flex items-center mt-3 text-xs text-gray-500">
                              <span>{prayer.date}</span>
                              <span className="mx-2 text-gray-400">•</span>
                              <span>{prayer.prayCount}명과 함께 기도</span>
                            </div>
                          </div>
                        ))}

                      {/* 기도카드가 없는 경우 */}
                      {memberContent.dailyShares.length === 0 &&
                        memberContent.prayerRequests.length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            아직 작성된 기도카드가 없습니다.
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PDF 최적화 버전 (숨겨져 있다가 PDF 생성 때만 사용) */}
      <div className="hidden" id="pdf-optimized-content">
        <div className="pdf-page">
          <div className="pdf-header">
            <h1
              style={{ fontSize: "24pt", margin: "0 0 5mm 0", color: "#333" }}
            >
              {groupName}
            </h1>
            <p style={{ fontSize: "12pt", margin: "0", color: "#666" }}>
              {groupDescription}
            </p>
          </div>

          <div
            className="pdf-section"
            style={{
              margin: "15mm 0",
              borderBottom: "1pt solid #eee",
              paddingBottom: "10mm",
            }}
          >
            <div
              className="pdf-section-title"
              style={{
                fontSize: "16pt",
                fontWeight: "bold",
                margin: "0 0 10mm 0",
                color: "#222",
                borderBottom: "2pt solid #4caf50",
                paddingBottom: "3mm",
                width: "100%",
              }}
            >
              그룹 현황
            </div>

            <div
              className="pdf-stats"
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div
                className="pdf-stat-item"
                style={{
                  textAlign: "center",
                  width: "33%",
                  padding: "5mm",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  borderRadius: "3mm",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <div
                  className="pdf-stat-value"
                  style={{
                    fontSize: "22pt",
                    fontWeight: "bold",
                    color: "#1a73e8",
                    margin: "0 0 2mm 0",
                  }}
                >
                  {Math.round(stats.weeklyPrayerCount / 7)}개
                </div>
                <div
                  className="pdf-stat-label"
                  style={{ fontSize: "11pt", color: "#555" }}
                >
                  오늘 기도
                </div>
              </div>

              <div
                className="pdf-stat-item"
                style={{
                  textAlign: "center",
                  width: "33%",
                  padding: "5mm",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  borderRadius: "3mm",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <div
                  className="pdf-stat-value"
                  style={{
                    fontSize: "22pt",
                    fontWeight: "bold",
                    color: "#1a73e8",
                    margin: "0 0 2mm 0",
                  }}
                >
                  {stats.weeklyPrayerCount}개
                </div>
                <div
                  className="pdf-stat-label"
                  style={{ fontSize: "11pt", color: "#555" }}
                >
                  이번 주 기도
                </div>
              </div>

              <div
                className="pdf-stat-item"
                style={{
                  textAlign: "center",
                  width: "33%",
                  padding: "5mm",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  borderRadius: "3mm",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <div
                  className="pdf-stat-value"
                  style={{
                    fontSize: "22pt",
                    fontWeight: "bold",
                    color: "#1a73e8",
                    margin: "0 0 2mm 0",
                  }}
                >
                  {stats.totalPrayerCards}개
                </div>
                <div
                  className="pdf-stat-label"
                  style={{ fontSize: "11pt", color: "#555" }}
                >
                  누적 기도
                </div>
              </div>
            </div>
          </div>

          <div className="pdf-section" style={{ margin: "0" }}>
            <div
              className="pdf-section-title"
              style={{
                fontSize: "16pt",
                fontWeight: "bold",
                margin: "0 0 10mm 0",
                color: "#222",
                borderBottom: "2pt solid #4caf50",
                paddingBottom: "3mm",
                width: "100%",
              }}
            >
              맴버별 기도카드
            </div>

            {memberContents.map((memberContent) => (
              <div
                key={memberContent.memberId}
                className="pdf-member-item"
                style={{
                  marginBottom: "8mm",
                  padding: "5mm",
                  border: "1pt solid #eee",
                  borderRadius: "2mm",
                  backgroundColor: "white",
                  pageBreakInside: "avoid",
                }}
              >
                <div
                  className="pdf-member-header"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "5mm",
                    borderBottom: "1pt solid #f0f0f0",
                    paddingBottom: "3mm",
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      backgroundColor: "#e8f5e9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "3mm",
                    }}
                  >
                    <span
                      style={{
                        color: "#4caf50",
                        fontWeight: "bold",
                        fontSize: "12pt",
                      }}
                    >
                      {memberContent.memberName.substring(0, 2)}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "14pt",
                      fontWeight: "bold",
                      color: "#333",
                    }}
                  >
                    {memberContent.memberName}
                  </span>
                  <span
                    style={{
                      fontSize: "9pt",
                      marginLeft: "3mm",
                      padding: "1mm 3mm",
                      borderRadius: "10mm",
                      backgroundColor:
                        memberContent.role === "그룹장" ? "#e8f5e9" : "#f5f5f5",
                      color:
                        memberContent.role === "그룹장" ? "#4caf50" : "#666",
                    }}
                  >
                    {memberContent.role === "그룹장" ? "그룹장" : "멤버"}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4mm",
                  }}
                >
                  {memberContent.dailyShares.map((share, index) => {
                    const prayer = memberContent.prayerRequests[index] || null;

                    return (
                      <div
                        key={share.id}
                        style={{
                          padding: "4mm",
                          borderLeft: "3pt solid #4caf50",
                          backgroundColor: "#f9f9f9",
                          marginBottom: "3mm",
                          borderRadius: "0 1mm 1mm 0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11pt",
                            fontWeight: "bold",
                            color: "#333",
                            marginBottom: "2mm",
                          }}
                        >
                          일상 나눔
                        </div>
                        <div
                          style={{
                            fontSize: "10pt",
                            color: "#333",
                            marginBottom: "3mm",
                            lineHeight: "1.4",
                          }}
                        >
                          {share.content}
                        </div>

                        {prayer && (
                          <>
                            <div
                              style={{
                                fontSize: "11pt",
                                fontWeight: "bold",
                                color: "#333",
                                marginTop: "3mm",
                                marginBottom: "2mm",
                                borderTop: "1pt dashed #ddd",
                                paddingTop: "2mm",
                              }}
                            >
                              기도 제목
                            </div>
                            <div
                              style={{
                                fontSize: "10pt",
                                color: "#333",
                                marginBottom: "3mm",
                                lineHeight: "1.4",
                              }}
                            >
                              {prayer.content}
                            </div>
                          </>
                        )}

                        <div
                          style={{
                            fontSize: "9pt",
                            color: "#666",
                            display: "flex",
                            justifyContent: "space-between",
                            borderTop: "1pt solid #eee",
                            paddingTop: "2mm",
                          }}
                        >
                          <span>{share.date}</span>
                          <span>
                            {prayer ? prayer.prayCount : 0}명과 함께 기도
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {memberContent.prayerRequests
                    .slice(memberContent.dailyShares.length)
                    .map((prayer) => (
                      <div
                        key={prayer.id}
                        style={{
                          padding: "4mm",
                          borderLeft: "3pt solid #4caf50",
                          backgroundColor: "#f9f9f9",
                          marginBottom: "3mm",
                          borderRadius: "0 1mm 1mm 0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11pt",
                            fontWeight: "bold",
                            color: "#333",
                            marginBottom: "2mm",
                          }}
                        >
                          기도 제목
                        </div>
                        <div
                          style={{
                            fontSize: "10pt",
                            color: "#333",
                            marginBottom: "3mm",
                            lineHeight: "1.4",
                          }}
                        >
                          {prayer.content}
                        </div>
                        <div
                          style={{
                            fontSize: "9pt",
                            color: "#666",
                            display: "flex",
                            justifyContent: "space-between",
                            borderTop: "1pt solid #eee",
                            paddingTop: "2mm",
                          }}
                        >
                          <span>{prayer.date}</span>
                          <span>{prayer.prayCount}명과 함께 기도</span>
                        </div>
                      </div>
                    ))}

                  {memberContent.dailyShares.length === 0 &&
                    memberContent.prayerRequests.length === 0 && (
                      <div
                        style={{
                          padding: "8mm",
                          textAlign: "center",
                          color: "#999",
                          backgroundColor: "#f9f9f9",
                          borderRadius: "2mm",
                        }}
                      >
                        아직 작성된 기도카드가 없습니다.
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              position: "fixed",
              bottom: "5mm",
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: "9pt",
              color: "#888",
              borderTop: "1pt solid #eee",
              paddingTop: "3mm",
            }}
          >
            PrayU - {new Date().toLocaleDateString()} - {groupName} 그룹 정보
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailPage;
