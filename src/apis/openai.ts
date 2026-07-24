import { supabase } from "./../../supabase/client";
import * as Sentry from "@sentry/react";

export interface QTData {
  scripture: { text: string; reference: string };
  meditation: {
    introduction: string;
    key_messages: { title: string; points: string[] }[];
  };
  application_questions: { question: string }[];
  practical_tasks: { task: string }[];
}

export type CreateQTResult = {
  data: QTData | null;
  errorCode?: "DAILY_LIMIT_EXCEEDED" | "LOGIN_REQUIRED";
};

export const createQT = async (content: string): Promise<CreateQTResult> => {
  try {
    // 개인별 일일 한도가 걸린 엔드포인트 — 세션 토큰 필수 (anon key는 서버가 401로 거부)
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return { data: null, errorCode: "LOGIN_REQUIRED" };

    const response = await fetch(
      `${import.meta.env.VITE_SUPA_PROJECT_URL}/functions/v1/openai/qt`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ content }),
      },
    );
    if (response.status === 429) {
      return { data: null, errorCode: "DAILY_LIMIT_EXCEEDED" };
    }
    if (response.status === 401) {
      return { data: null, errorCode: "LOGIN_REQUIRED" };
    }
    if (!response.ok) {
      Sentry.captureMessage(`createQT failed: ${response.status}`);
      return { data: null };
    }
    return { data: (await response.json()) as QTData };
  } catch (error) {
    Sentry.captureException(error);
    return { data: null };
  }
};
