import {
  apiGet,
  apiPost,
} from "./api";

export type PushSubscriptionStatus = {
  subscribed: boolean;
  subscriptionId?: string;
  lastSeenOn?: string | null;
};

export type PushEnableResult = {
  success: boolean;
  permission: NotificationPermission;
  subscription?: PushSubscription;
};

function urlBase64ToUint8Array(
  base64String: string
): Uint8Array {
  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 = (
    base64String + padding
  )
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData =
    window.atob(base64);

  return Uint8Array.from(
    [...rawData].map(
      (char) =>
        char.charCodeAt(0)
    )
  );
}

export function isPushSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function getNotificationPermission():
  NotificationPermission {
  if (!("Notification" in window)) {
    return "denied";
  }

  return Notification.permission;
}

async function getServiceWorkerRegistration():
  Promise<ServiceWorkerRegistration> {
  if (
    !("serviceWorker" in navigator)
  ) {
    throw new Error(
      "Service workers are not supported."
    );
  }

  const registration =
    await navigator.serviceWorker.ready;

  return registration;
}

export async function getBrowserPushSubscription():
  Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    return null;
  }

  const registration =
    await getServiceWorkerRegistration();

  return registration.pushManager
    .getSubscription();
}

function getDeviceName(): string {
  const ua = navigator.userAgent;

  if (/android/i.test(ua)) {
    return "Android";
  }

  if (/iphone|ipad|ipod/i.test(ua)) {
    return "iOS";
  }

  if (/windows/i.test(ua)) {
    return "Windows";
  }

  if (/macintosh|mac os x/i.test(ua)) {
    return "macOS";
  }

  return "Browser";
}

async function saveSubscription(
  subscription: PushSubscription
) {
  const json =
    subscription.toJSON();

  const p256dh =
    json.keys?.p256dh;

  const auth =
    json.keys?.auth;

  if (
    !subscription.endpoint ||
    !p256dh ||
    !auth
  ) {
    throw new Error(
      "Push subscription is incomplete."
    );
  }

  return apiPost<{
    success: boolean;
    subscriptionId: string;
    active: boolean;
  }>(
    "/api/method/club100_core.api.push_notifications.subscribe",
    {
      endpoint:
        subscription.endpoint,

      p256dh_key:
        p256dh,

      auth_key:
        auth,

      device_name:
        getDeviceName(),

      user_agent:
        navigator.userAgent,
    }
  );
}

export async function enablePushNotifications(
  vapidPublicKey: string
): Promise<PushEnableResult> {
  if (!isPushSupported()) {
    throw new Error(
      "Push notifications are not supported on this device."
    );
  }

  let permission =
    Notification.permission;

  if (permission === "default") {
    permission =
      await Notification.requestPermission();
  }

  if (permission !== "granted") {
    return {
      success: false,
      permission,
    };
  }

  const registration =
    await getServiceWorkerRegistration();

  let subscription =
    await registration.pushManager
      .getSubscription();

  if (!subscription) {
    subscription =
      await registration.pushManager
        .subscribe({
          userVisibleOnly: true,

          applicationServerKey:
            urlBase64ToUint8Array(
              vapidPublicKey
            ) as BufferSource,
        });
  }

  await saveSubscription(
    subscription
  );

  return {
    success: true,
    permission,
    subscription,
  };
}

export async function disablePushNotifications():
  Promise<boolean> {
  const subscription =
    await getBrowserPushSubscription();

  if (!subscription) {
    return true;
  }

  await apiPost(
    "/api/method/club100_core.api.push_notifications.unsubscribe",
    {
      endpoint:
        subscription.endpoint,
    }
  );

  await subscription.unsubscribe();

  return true;
}

export async function getPushSubscriptionStatus():
  Promise<PushSubscriptionStatus> {
  const subscription =
    await getBrowserPushSubscription();

  if (!subscription) {
    return {
      subscribed: false,
    };
  }

  const params =
    new URLSearchParams({
      endpoint:
        subscription.endpoint,
    });

  return apiGet<PushSubscriptionStatus>(
    `/api/method/club100_core.api.push_notifications.status?${params.toString()}`
  );
}