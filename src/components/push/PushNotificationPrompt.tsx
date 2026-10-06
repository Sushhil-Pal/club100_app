import {
  useEffect,
  useState,
} from "react";

import {
  enablePushNotifications,
  getBrowserPushSubscription,
  getNotificationPermission,
  getPushSubscriptionStatus,
  isPushSupported,
} from "../../services/pushNotificationService";

import {
  VAPID_PUBLIC_KEY,
} from "../../config/push";

type PushState =
  | "loading"
  | "unsupported"
  | "blocked"
  | "disabled"
  | "enabled";

export default function PushNotificationPrompt() {
  const [
    pushState,
    setPushState,
  ] = useState<PushState>(
    "loading"
  );

  const [
    isEnabling,
    setIsEnabling,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkPushStatus() {
      try {
        if (!isPushSupported()) {
          if (!cancelled) {
            setPushState(
              "unsupported"
            );
          }

          return;
        }

        const permission =
          getNotificationPermission();

        if (
          permission === "denied"
        ) {
          if (!cancelled) {
            setPushState(
              "blocked"
            );
          }

          return;
        }

        const subscription =
          await getBrowserPushSubscription();

        /*
         * No browser subscription yet.
         *
         * Show the global Enable Notifications
         * prompt.
         */
        if (!subscription) {
          if (!cancelled) {
            setPushState(
              "disabled"
            );
          }

          return;
        }

        /*
         * Browser already has a subscription.
         *
         * Check whether the same endpoint is
         * registered and active in Frappe.
         */
        try {
          const backendStatus =
            await getPushSubscriptionStatus();

          if (
            backendStatus.subscribed
          ) {
            if (!cancelled) {
              setPushState(
                "enabled"
              );
            }

            return;
          }

          /*
           * Browser subscription exists,
           * but ERP registration is missing.
           *
           * Re-use the existing browser
           * subscription and save it back
           * to Frappe.
           */
          const repairResult =
            await enablePushNotifications(
              VAPID_PUBLIC_KEY
            );

          if (
            repairResult.success
          ) {
            if (!cancelled) {
              setPushState(
                "enabled"
              );
            }

            return;
          }
        } catch (repairError) {
          console.error(
            "Unable to verify or repair push registration:",
            repairError
          );
        }

        /*
         * Browser subscription exists, but
         * we could not verify/repair ERP.
         *
         * Keep the prompt available so the
         * user has an explicit recovery path.
         */
        if (!cancelled) {
          setPushState(
            "disabled"
          );
        }
      } catch (checkError) {
        console.error(
          "Unable to check push status:",
          checkError
        );

        if (!cancelled) {
          setPushState(
            "disabled"
          );
        }
      }
    }

    void checkPushStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleEnable =
    async () => {
      setError("");
      setIsEnabling(true);

      try {
        const result =
          await enablePushNotifications(
            VAPID_PUBLIC_KEY
          );

        if (
          result.success
        ) {
          setPushState(
            "enabled"
          );

          return;
        }

        if (
          result.permission ===
          "denied"
        ) {
          setPushState(
            "blocked"
          );

          return;
        }

        setError(
          "Notifications could not be enabled. Please try again."
        );
      } catch (enableError) {
        console.error(
          "Unable to enable push notifications:",
          enableError
        );

        if (
          getNotificationPermission() ===
          "denied"
        ) {
          setPushState(
            "blocked"
          );
        } else {
          setError(
            "Notifications could not be enabled. Please try again."
          );
        }
      } finally {
        setIsEnabling(false);
      }
    };

  if (
    pushState === "loading" ||
    pushState === "unsupported" ||
    pushState === "enabled"
  ) {
    return null;
  }

  if (
    pushState === "blocked"
  ) {
    return (
      <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xl">
            🔔
          </div>

          <div>
            <p className="font-semibold text-slate-900">
              Notifications are blocked
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Allow notifications for
              Club100 in your browser
              settings to receive session
              reminders and important
              updates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-2xl border border-blue-100 bg-white px-4 py-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xl">
            🔔
          </div>

          <div>
            <p className="font-semibold text-slate-900">
              Stay updated with Club100
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Get reminders for upcoming
              sessions and important
              Club100 updates.
            </p>

            {error && (
              <p className="mt-2 text-sm font-medium text-red-600">
                {error}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={
            handleEnable
          }
          disabled={
            isEnabling
          }
          className="shrink-0 rounded-xl bg-[#2F80ED] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1F6FD1] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isEnabling
            ? "Enabling..."
            : "Enable Notifications"}
        </button>
      </div>
    </div>
  );
}