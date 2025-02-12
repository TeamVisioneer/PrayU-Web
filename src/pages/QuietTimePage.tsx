import { useForm, useFormState } from "react-hook-form";
import { useState, useEffect } from "react";
import { analyticsTrack } from "@/analytics/analytics";
import useBaseStore from "@/stores/baseStore";
import { AiOutlineLoading } from "react-icons/ai";
import { useSearchParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { parseBibleVerse } from "@/lib/utils";
import * as Sentry from "@sentry/react";

interface FormValues {
  content: string;
}

const QuietTimePage = () => {
  const user = useBaseStore((state) => state.user);
  const [searchParams] = useSearchParams();
  const { register, handleSubmit, control } = useForm<FormValues>();
  const { isSubmitting } = useFormState({ control });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [qtDataId, setQtDataId] = useState<string>("");

  const qtData = useBaseStore((state) => state.qtData);
  const setQtData = useBaseStore((state) => state.setQtData);
  const createQtData = useBaseStore((state) => state.createQtData);
  const fetchQtData = useBaseStore((state) => state.fetchQtData);
  const targetBibleList = useBaseStore((state) => state.targetBibleList);
  const fetchBibleList = useBaseStore((state) => state.fetchBibleList);

  const verseParams = searchParams.get("verse");

  useEffect(() => {
    if (!user) return;

    if (verseParams) {
      const verseData = parseBibleVerse(verseParams);
      if (!verseData) return;
      const { label, chapter, paragraph, endParagraph } = verseData;
      fetchQtDaily(label, chapter, paragraph, endParagraph || paragraph);
    }
  }, [user]);

  const fetchQtByUser = async (
    longLabel: string,
    chapter: number,
    startParagraph: number,
    endParagraph: number
  ) => {
    if (loading) return;
    try {
      setLoading(true);
      const targetBibleList = await fetchBibleList(
        longLabel,
        chapter,
        startParagraph,
        endParagraph
      );
      if (targetBibleList) {
        const qtData = await createQtData(
          user?.id || null,
          longLabel,
          chapter,
          startParagraph,
          endParagraph,
          targetBibleList[0].sentence
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
    }
  };

  const fetchQtDaily = async (
    longLabel: string,
    chapter: number,
    startParagraph: number,
    endParagraph: number
  ) => {
    if (loading) return;
    try {
      setLoading(true);
      const targetBibleList = await fetchBibleList(
        longLabel,
        chapter,
        startParagraph,
        endParagraph
      );
      if (targetBibleList && targetBibleList.length > 0) {
        const qtData = await fetchQtData(
          longLabel,
          chapter,
          startParagraph,
          endParagraph
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
            targetBibleList[0].sentence
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

  const onSubmit = async (data: FormValues) => {
    analyticsTrack("클릭_QT_생성", {});
    setError(null);
    const verseData = parseBibleVerse(data.content);
    if (!verseData) {
      setError("올바른 성경 구절을 입력해주세요.");
      return;
    }
    const { label, chapter, paragraph, endParagraph } = verseData;
    await fetchQtByUser(label, chapter, paragraph, endParagraph || paragraph);
  };

  const inputVerseForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <label className="flex flex-col justify-center text-lg font-semibold">
        <p className="text-center text-2xl">📚 나만의 QT 만들기</p>
        <p className="text-center text-base font-normal text-gray-500">
          여러분의 특별한 QT를 만들어봐요!
        </p>
      </label>
      <input
        type="text"
        placeholder="성경 구절을 입력하기(창세기 1:1, 시편 23:1-6)"
        {...register("content", { required: true })}
        className="border p-2 rounded-md w-full"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className={`items-center justify-center text-white p-2 rounded-md w-full ${
          isSubmitting ? "bg-gray-400" : "bg-blue-500"
        }`}
      >
        {isSubmitting ? (
          <div className="flex justify-between items-center">
            <AiOutlineLoading className="animate-spin mr-2" size={20} />
            QT를 생성중이에요...
          </div>
        ) : (
          "QT 생성하기"
        )}
      </button>
    </form>
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
      <Button
        className=""
        variant="primary"
        onClick={() => {
          window.history.replaceState(null, "", window.location.pathname);
          window.location.reload();
        }}
      >
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

  return (
    <div className="p-5">
      <div className="w-full flex justify-between items-center">
        <div className="w-14">
          <IoChevronBack size={20} onClick={() => window.history.back()} />
        </div>
        <span className="w-14"></span>
      </div>
      <div className="flex flex-col p-4 gap-5">
        {loading ? (
          <div className="absolute inset-0 flex justify-center items-center">
            <AiOutlineLoading className="animate-spin mr-2" size={30} />
            <p className="text-lg font-bold">QT를 생성 중이에요...</p>
          </div>
        ) : !qtData && user ? (
          inputVerseForm()
        ) : (
          qtContent()
        )}
        {error && <div className="text-red-500">{error}</div>}
      </div>
    </div>
  );
};

export default QuietTimePage;
