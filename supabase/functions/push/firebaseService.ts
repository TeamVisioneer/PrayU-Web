import { JWT } from "npm:google-auth-library@9";

interface Notification {
  id: string;
  user_id: string;
  title: string | null;
  body: string | null;
}

export class FirebaseService {
  async getAccessToken() {
    try {
      const jwtClient = new JWT({
        email: Deno.env.get("FIREBASE_CLIENT_EMAIL"),
        key: Deno.env.get("FIREBASE_PRIVATE_KEY"),
        scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
      });
      const token = await jwtClient.authorize();
      return token.access_token || null;
    } catch (error) {
      console.error("Error getting access token:", error.message);
      return null;
    }
  }

  async sendNotification(
    fcmToken: string,
    notification: Notification,
    accessToken: string,
  ) {
    try {
      const firebaseProjectID = Deno.env.get("FIREBASE_PROJECT_ID");
      const res = await fetch(
        `https://fcm.googleapis.com/v1/projects/${firebaseProjectID}/messages:send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            message: {
              token: fcmToken,
              notification: {
                title: notification.title,
                body: notification.body,
              },
            },
          }),
        },
      );

      const resData = await res.json();

      if (res.status < 200 || 299 < res.status) {
        const errorCode = resData.error?.details?.[0]?.errorCode ||
          resData.error?.status || "UNKNOWN_ERROR";
        console.error("Error sending FCM message:", errorCode);
        return { fcmToken, status: errorCode };
      } else {
        return { fcmToken, status: "SUCCESS" };
      }
    } catch (err) {
      console.error("Error sending FCM message:", err);
      return { fcmToken, status: "SEND_ERROR" };
    }
  }

  async bulkSendNotifications(
    fcmTokens: string[],
    notification: Notification,
    accessToken: string,
  ) {
    const pushNotificationPromises = fcmTokens.map((fcmToken) =>
      this.sendNotification(fcmToken, notification, accessToken)
    );
    const results = await Promise.all(pushNotificationPromises);
    const resultSummary: { [key: string]: string[] } = { "SUCCESS": [] };
    results.forEach(({ fcmToken, status }) => {
      if (status === "SUCCESS") {
        resultSummary["SUCCESS"].push(fcmToken);
      } else {
        if (!resultSummary[status]) {
          resultSummary[status] = [];
        }
        resultSummary[status].push(fcmToken);
      }
    });

    return resultSummary;
  }
}
