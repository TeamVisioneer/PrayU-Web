import { useForm, useFormState } from "react-hook-form";
import { useState } from "react";
import { createQT, QTData } from "@/apis/openai";
import { analyticsTrack } from "@/analytics/analytics";

interface FormValues {
  content: string;
}

const QuietTimePage = () => {
  const { register, handleSubmit, control } = useForm<FormValues>();
  const { isSubmitting } = useFormState({ control });
  const [qtData, setQtData] = useState<QTData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    analyticsTrack("클릭_QT_생성", {});
    setError(null);
    try {
      const fetchedData = await createQT(data.content);
      setQtData(fetchedData);
    } catch (err) {
      setError("QT 데이터를 가져오는 중 오류가 발생했습니다.");
      console.error(err);
    }
  };

  const inputVerseForm = () => {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label className="flex justify-center text-lg font-semibold">
          📚 오늘의 QT
        </label>
        <input
          type="text"
          placeholder="성경 구절을 입력해주세요 (ex. 창세기 1:1)"
          {...register("content", { required: true })}
          className="border p-2 rounded-md w-full"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={`text-white p-2 rounded-md w-full ${
            isSubmitting ? "bg-gray-400" : "bg-blue-500"
          }`}
        >
          {isSubmitting ? "QT를 생성중이에요..." : "QT 생성하기"}
        </button>
      </form>
    );
  };

  const qtContent = () => {
    return (
      <div className="flex flex-col gap-5 fade-in">
        <section className="flex flex-col bg-white p-3 rounded-lg gap-3">
          <p className="text-xl font-bold">💬 본문 말씀</p>
          <p className="italic">
            "{qtData!.scripture.text}" - {qtData!.scripture.reference}
          </p>
        </section>
        <section className="flex flex-col bg-white p-3 rounded-lg gap-3">
          <p className="text-xl font-bold">🤔 말씀 묵상</p>
          <p>{qtData!.meditation.introduction}</p>
          <p className="text-lg font-semibold">핵심 메시지</p>
          {qtData!.meditation.key_messages.map((msg, idx) => (
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
            {qtData!.application_questions.map((q, idx) => (
              <li key={idx}>{q.question}</li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col bg-white p-3 rounded-lg gap-3">
          <h2 className="text-xl font-bold">🎈 실천 과제</h2>
          <ul className="list-disc pl-6">
            {qtData!.practical_tasks.map((task, idx) => (
              <li key={idx}>{task.task}</li>
            ))}
          </ul>
        </section>
      </div>
    );
  };

  return (
    <div className="flex flex-col p-4 gap-5">
      {!qtData ? inputVerseForm() : qtContent()}
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default QuietTimePage;
