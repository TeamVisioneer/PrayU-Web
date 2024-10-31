import * as Sentry from "@sentry/react";

export interface BibleVerseData {
  keyword: string;
  body: string;
  verse: string;
  nature: string;
}

export const createBibleVerse = async (
  content: string,
): Promise<BibleVerseData[]> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPA_PROJECT_URL}/functions/v1/openai/bible-verse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${import.meta.env.VITE_SUPA_ANON_KEY}`,
        },
        body: JSON.stringify({ content }),
      },
    );

    const { data } = await response.json();
    return data;
  } catch (error) {
    Sentry.captureException(error);
    return [];
  }
};

export const fetchBgImage = async (content: string): Promise<string[]> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPA_PROJECT_URL}/functions/v1/openai/bible-image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${import.meta.env.VITE_SUPA_ANON_KEY}`,
        },
        body: JSON.stringify({ content }),
      },
    );

    const { data } = await response.json();
    return data;
  } catch (error) {
    Sentry.captureException(error);
    return [];
  }
};
