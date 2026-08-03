import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/common/PageHeader";
import { useSearchParams } from "react-router-dom";
import { analyticsTrack } from "@/analytics/analytics";
import useBaseStore from "@/stores/baseStore";
import { AiOutlineLoading } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import BibleVersePicker, {
  BibleVerseSelection,
} from "@/components/qt/BibleVersePicker";
import { BIBLE_BOOKS } from "@/data/bibleStructure";
import { fetchTodayLlmUsage } from "@/apis/llmUsage";
import { parseBibleVerse } from "@/lib/utils";
import * as Sentry from "@sentry/react";

// 표시용 상수. 실제 강제는 functions/openai(QT_DAILY_LIMIT env)가 담당 — 서버가 진실
const QT_DAILY_LIMIT = 10;

const DEFAULT_SELECTION: BibleVerseSelection = {
  book: BIBLE_BOOKS[0], // 창세기
  chapter: 1,
  startParagraph: 1,
  endParagraph: 1,
};

const QuietTimePage = () => {
  const user = useBaseStore((state) => state.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selection, setSelection] =
    useState<BibleVerseSelection>(DEFAULT_SELECTION);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [qtDataId, setQtDataId] = useState<string>("");
  const [todayUsedCount, setTodayUsedCount] = useState<number | null>(null);

  const qtData = useBaseStore((state) => state.qtData);
  const setQtData = useBaseStore((state) => state.setQtData);
  const createQtData = useBaseStore((state) => state.createQtData);
  const fetchQtData = useBaseStore((state) => state.fetchQtData);
  const targetBibleList = useBaseStore((state) => state.targetBibleList);
  const fetchBibleList = useBaseStore((state) => state.fetchBibleList);

  const verseParams = searchParams.get("verse");
  // 표시용 남은 횟수. 조회 실패(null)면 표시만 생략 — 실제 한도는 서버가 강제
  const remainingCount =
    todayUsedCount === null
      ? null
      : Math.max(0, QT_DAILY_LIMIT - todayUsedCount);

  const refreshUsage = useCallback(() => {
    if (!user) return;
    fetchTodayLlmUsage(user.id, "qt").then(setTodayUsedCount);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    refreshUsage();
  }, [user, refreshUsage]);

  useEffect(() => {
    if (!user) return;

    // 외부 링크 호환: /qt?verse=창세기 1:1 진입 시 자동 생성(캐시 우선) + 픽커 동기화
    if (verseParams) {
      const verseData = parseBibleVerse(verseParams);
      if (!verseData) return;
      const { label, chapter, paragraph, endParagraph } = verseData;
      const book = BIBLE_BOOKS.find(
        (b) => b.longLabel === label || b.shortLabel === label,
      );
      if (book) {
        setSelection({
          book,
          chapter,
          startParagraph: paragraph,
          endParagraph: endParagraph || paragraph,
        });
      }
      fetchQtDaily(label, chapter, paragraph, endParagraph || paragraph);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchQtByUser = async (
    longLabel: string,
    chapter: number,
    startParagraph: number,
    endParagraph: number,
  ) => {
    if (loading) return;
    try {
      setLoading(true);
      const targetBibleList = await fetchBibleList(
        longLabel,
        chapter,
        startParagraph,
        endParagraph,
      );
      if (targetBibleList) {
        const qtData = await createQtData(
          user?.id || null,
          longLabel,
          chapter,
          startParagraph,
          endParagraph,
          targetBibleList[0].sentence,
        );
        if (qtData) {
          setQtData(JSON.parse(qtData.result as string));
          setQtDataId(qtData.id);
        }
      } else {
        setError("입력한 성경구절이 존재하지 않습니다.");
      }
    } catch (err) {
      setError("QT 데이터를 가져오는 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
      refreshUsage();
    }
  };

  const fetchQtDaily = async (
    longLabel: string,
    chapter: number,
    startParagraph: number,
    endParagraph: number,
  ) => {
    if (loading) return;
    try {
      setLoading(true);
      const targetBibleList = await fetchBibleList(
        longLabel,
        chapter,
        startParagraph,
        endParagraph,
      );
      if (targetBibleList && targetBibleList.length > 0) {
        const qtData = await fetchQtData(
          longLabel,
          chapter,
          startParagraph,
          endParagraph,
        );

        if (
          qtData &&
          qtData.length > 0 &&
          typeof qtData[0].result === "string"
        ) {
          setQtData(JSON.parse(qtData[0].result));
          setQtDataId(qtData[0].id);
        } else {
          const newQtData = await createQtData(
            user!.id,
            longLabel,
            chapter,
            startParagraph,
            endParagraph,
            targetBibleList[0].sentence,
          );
          if (newQtData && typeof newQtData.result === "string") {
            setQtData(JSON.parse(newQtData.result));
            setQtDataId(newQtData.id);
          }
        }
      } else {
        setError("입력한 성경구절이 존재하지 않습니다.");
      }
    } catch (err) {
      setError("QT 데이터를 가져오는 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
      refreshUsage();
    }
  };

  const onClickReport = async () => {
    analyticsTrack("클릭_문의", { where: "QtPage" });

    const DISCORD_REPORT_WEBHOOK = import.meta.env.VITE_DISCORD_REPORT_WEBHOOK;
    const payload = {
      content: null,
      embeds: [
        {
          title: "카테고리",
          description: "QT 신고",
          color: null,
          fields: [
            { name: "제보 유저 ID", value: user?.id },
            { name: "신고 QT ID", value: qtDataId },
          ],
        },
      ],
      attachments: [],
    };

    try {
      const response = await fetch(DISCORD_REPORT_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        window.location.href = import.meta.env.VITE_PRAY_KAKAO_CHANNEL_CHAT_URL;
      } else {
        Sentry.captureException(response.statusText);
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  const onClickCreate = async () => {
    analyticsTrack("클릭_QT_생성", {});
    setError(null);
    const { book, chapter, startParagraph, endParagraph } = selection;
    await fetchQtByUser(book.longLabel, chapter, startParagraph, endParagraph);
  };

  const onClickReset = () => {
    // 전체 리로드 없이 상태만 초기화
    setQtData(null);
    setQtDataId("");
    setError(null);
    if (verseParams) setSearchParams({}, { replace: true });
  };

  const selectionSummary = `${selection.book.longLabel} ${selection.chapter}:${
    selection.startParagraph
  }${
    selection.endParagraph > selection.startParagraph
      ? `-${selection.endParagraph}`
      : ""
  }`;

  const renderHeader = () => <PageHeader title="QT 만들기" />;

  const versePickerForm = () => (
    <div className="flex flex-col gap-4">
      <section className="pt-1 text-center">
        <p className="text-[22px] font-bold leading-snug text-gray-950">
          말씀으로 시작하는 묵상
        </p>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          묵상하고 싶은 성경 구절을 선택하면
          <br />
          말씀 묵상과 적용 질문을 만들어드려요.
        </p>
      </section>

      <BibleVersePicker
        value={selection}
        onChange={setSelection}
        disabled={loading}
      />

      <div>
        <p className="pb-3 text-center text-base font-semibold text-gray-800">
          {selectionSummary}
        </p>
        <Button
          variant="primary"
          onClick={onClickCreate}
          disabled={loading || remainingCount === 0}
          className="h-[52px] w-full rounded-xl text-base disabled:opacity-70"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <AiOutlineLoading className="mr-2 animate-spin" size={20} />
              QT를 생성 중이에요...
            </div>
          ) : remainingCount === 0 ? (
            "오늘 생성 횟수를 모두 사용했어요"
          ) : (
            "QT 생성하기"
          )}
        </Button>
        {!loading && remainingCount !== null && remainingCount > 0 && (
          <p className="mt-2 text-center text-xs text-gray-400">
            오늘 남은 생성 {remainingCount}회
          </p>
        )}
      </div>
    </div>
  );

  const qtContent = () => (
    <div className="flex flex-col gap-5 fade-in">
      <section className="flex flex-col bg-white p-3 rounded-lg gap-3">
        <p className="text-xl font-bold">💬 본문 말씀</p>
        {targetBibleList && (
          <div className="italic">
            {targetBibleList.map((bible, idx) => (
              <p key={idx}>
                {bible.paragraph}. {bible.sentence}{" "}
              </p>
            ))}
            <p>
              {targetBibleList[0].long_label} {targetBibleList[0].chapter}:
              {targetBibleList[0].paragraph}
              {targetBibleList.length > 1 &&
                -targetBibleList[targetBibleList.length - 1].paragraph}
            </p>
          </div>
        )}
      </section>
      <section className="flex flex-col bg-white p-3 rounded-lg gap-3">
        <p className="text-xl font-bold">🤔 말씀 묵상</p>
        <p>{qtData?.meditation.introduction}</p>
        <p className="text-lg font-semibold">핵심 메시지</p>
        {qtData?.meditation.key_messages.map((msg, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <p className="text-center font-semibold text-sm bg-start text-white rounded-lg inline-block py-1 px-2">
              {msg.title}
            </p>
            <ul className="list-disc pl-6">
              {msg.points.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      <section className="flex flex-col bg-white p-3 rounded-lg gap-3">
        <h2 className="text-xl font-bold">✅ 적용 질문</h2>
        <ul className="list-disc pl-6">
          {qtData?.application_questions.map((q, idx) => (
            <li key={idx}>{q.question}</li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col bg-white p-3 rounded-lg gap-3">
        <h2 className="text-xl font-bold">🎈 실천 과제</h2>
        <ul className="list-disc pl-6">
          {qtData?.practical_tasks.map((task, idx) => (
            <li key={idx}>{task.task}</li>
          ))}
        </ul>
      </section>
      <Button variant="primary" onClick={onClickReset}>
        나만의 QT 만들기
      </Button>
      <a
        className="text-center text-sm text-gray-400 underline"
        onClick={() => onClickReport()}
      >
        내용에 문제가 있나요?
      </a>
    </div>
  );

  if (!user) {
    return (
      <div className="flex h-full w-full flex-col bg-mainBg">
        {renderHeader()}
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <h1 className="text-xl font-bold">로그인이 필요해요</h1>
          <p className="text-sm text-gray-500">
            나만의 QT를 만들려면 먼저 로그인해 주세요.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-mainBg">
      {renderHeader()}
      <main className="flex-1 overflow-y-auto">
        <div className="flex min-h-full w-full flex-col gap-4 px-5 pb-8 pt-5">
          {!qtData ? versePickerForm() : qtContent()}
          {error && <div className="text-red-500">{error}</div>}
        </div>
      </main>
    </div>
  );
};

export default QuietTimePage;
