//import { deleteUser } from '@/apis/user';
// export const deleteUser = async () => {
//   const response = await fetch("/api/deleteUser", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ userId }),
//   });

//   const data = await response.json();
//   if (response.status !== 200) {
//     throw new Error(data.error || "Failed to delete user");
//   }
//   return data;
// };

export const helloUser = async (): Promise<any> => {
  try {
    const response = await fetch(
      "https://cguxpeghdqcqfdhvkmyv.supabase.co/functions/v1/hello-world",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPA_ANON_KEY, // 여기에 적절한 API 키를 넣어야 합니다.
          Authorization: `Bearer ${import.meta.env.VITE_SUPA_ANON_KEY}`, // 이것도 마찬가지로 적절한 토큰으로 대체해야 합니다.
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch the hello-world function");
    }

    const data = await response.json();
    console.log("Data from hello-world function:", data);
    return data;
  } catch (error: any) {
    console.error("Error calling hello-world function:", error.message);
    throw new Error(error.message || "Failed to call function");
  }
};
