export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPA_PROJECT_URL}/functions/v1/delete-user`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPA_ANON_KEY,
          authorization: `Bearer ${import.meta.env.VITE_SUPA_ANON_KEY}`,
        },
        body: JSON.stringify({ userId }), // userId를 body에 포함시킴
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    if (!data) return false;
    return true;
  } catch {
    return false;
  }
};
