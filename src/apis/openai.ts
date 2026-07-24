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

export const createQT = async (content: string): Promise<QTData | null> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPA_PROJECT_URL}/functions/v1/openai/qt`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${import.meta.env.VITE_SUPA_ANON_KEY}`,
        },
        body: JSON.stringify({ content }),
      },
    );
    return response.json();
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};
