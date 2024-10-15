import { FCMTokenRepository } from "./fcmTokenRepository.ts";
import { FirebaseService } from "./firebaseService.ts";
import { NotificationRepository } from "./notificationRepository.ts";

interface Notification {
  id: string;
  user_id: string;
  title: string | null;
  body: string | null;
}

interface NotificationPayload {
  type: "INSERT";
  table: string;
  notification: Notification;
  schema: "public";
}

Deno.serve(async (req) => {
  const payload: NotificationPayload = await req.json();

  const notificationRepo = new NotificationRepository();
  const fcmTokenRepo = new FCMTokenRepository();
  const firebaseService = new FirebaseService();

  const accessToken = await firebaseService.getAccessToken();
  if (!accessToken) {
    await notificationRepo.updateNotification(
      payload.notification.id,
      {
        completed_at: new Date().toISOString(),
        fcm_result: { "NO_ACCESS": [] },
      },
    );
    return new Response(
      JSON.stringify({ error: "Failed to get access token" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  }

  const fcmTokenData = await fcmTokenRepo.fetchFCMTokenByUserId(
    payload.notification.user_id,
  );
  if (!fcmTokenData) {
    await notificationRepo.updateNotification(
      payload.notification.id,
      {
        completed_at: new Date().toISOString(),
        fcm_result: { "NOT_EXIST_USER": [] },
      },
    );
    return new Response(
      JSON.stringify({ error: "No FCM tokens found for the user" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 404,
      },
    );
  }

  const fcmTokens = fcmTokenData.map((row) => row.token);
  const resultSummary = await firebaseService.bulkSendNotifications(
    fcmTokens,
    payload.notification,
    accessToken,
  );
  await notificationRepo.updateNotification(
    payload.notification.id,
    { completed_at: new Date().toISOString(), fcm_result: resultSummary },
  );
  return new Response(JSON.stringify(resultSummary), {
    headers: { "Content-Type": "application/json" },
  });
});
