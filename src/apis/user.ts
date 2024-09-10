export const deleteUser = async (userId: string): Promise<any> => {
  try {
    const response = await fetch(
      `https://cguxpeghdqcqfdhvkmyv.supabase.co/functions/v1/delete-user`,
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
