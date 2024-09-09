export const deleteUser = async (userId: string): Promise<any> => {
  try {
    const response = await fetch(
      `https://cguxpeghdqcqfdhvkmyv.supabase.co/functions/v1/delete-user?userId=${userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPA_ANON_KEY, // API 키를 설정합니다.
          Authorization: `Bearer ${import.meta.env.VITE_SUPA_ANON_KEY}`, // Bearer 토큰을 설정합니다.
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch the delete-user function");
    }

    const data = await response.json();
    console.log("Data from delete-user function:", data);
    return data;
  } catch (error: any) {
    console.error("Error in delete-user function:", error.message);
    throw new Error(error.message || "Failed to call function");
  }
};
