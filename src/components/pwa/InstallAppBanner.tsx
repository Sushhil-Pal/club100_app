import {
  useState,
} from "react";

import {
  usePwaInstall,
} from "../../hooks/usePwaInstall";

export default function InstallAppBanner() {
  const {
    isInstalled,
    isIOS,
    canInstall,
    install,
  } = usePwaInstall();

  const [
    showIOSHelp,
    setShowIOSHelp,
  ] = useState(false);

  const [
    isInstalling,
    setIsInstalling,
  ] = useState(false);

  const shouldShow =
    !isInstalled &&
    (
      canInstall ||
      isIOS
    );

  if (!shouldShow) {
    return null;
  }

  async function handleInstall() {
    if (isIOS) {
      setShowIOSHelp(
        true
      );

      return;
    }

    if (!canInstall) {
      return;
    }

    setIsInstalling(
      true
    );

    try {
      await install();
    } finally {
      setIsInstalling(
        false
      );
    }
  }

  return (
    <>
      <section className="mb-5 rounded-2xl border border-[#BFD9F7] bg-[#F5FAFE] p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <img
              src="/icons/icon-192.png"
              alt=""
              className="h-12 w-12 rounded-xl"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-[#12395B]">
              Install Club100
            </h2>

            <p className="mt-1 text-sm leading-5 text-slate-600">
              Add Club100 to your{" "}
              {isIOS
                ? "Home Screen"
                : "device"}{" "}
              for faster access
              and notifications.
            </p>

            <div className="mt-4">
              <button
                type="button"
                onClick={
                  handleInstall
                }
                disabled={
                  isInstalling
                }
                className="rounded-xl bg-[#2F80ED] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1F6FD1] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isInstalling
                  ? "Installing..."
                  : isIOS
                    ? "Show Me How"
                    : "Install App"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {showIOSHelp && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
          onClick={() =>
            setShowIOSHelp(
              false
            )
          }
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="ios-install-title"
                  className="text-xl font-bold text-[#12395B]"
                >
                  Install Club100
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Add Club100 to
                  your iPhone or
                  iPad Home Screen.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowIOSHelp(
                    false
                  )
                }
                className="rounded-lg px-2 py-1 text-2xl leading-none text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <InstructionStep
                number="1"
                title="Tap Share"
                text="In Safari, tap the Share button in the browser toolbar."
              />

              <InstructionStep
                number="2"
                title="Add to Home Screen"
                text='Scroll through the Share menu and tap "Add to Home Screen".'
              />

              <InstructionStep
                number="3"
                title="Tap Add"
                text="Confirm the name Club100 and tap Add."
              />
            </div>

            <div className="mt-6 rounded-xl bg-[#F5FAFE] p-4 text-sm leading-5 text-slate-600">
              After installation,
              open Club100 from the
              Home Screen instead of
              Safari.
            </div>

            <button
              type="button"
              onClick={() =>
                setShowIOSHelp(
                  false
                )
              }
              className="mt-6 w-full rounded-xl bg-[#2F80ED] px-4 py-3 font-semibold text-white transition hover:bg-[#1F6FD1]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function InstructionStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF4FC] font-bold text-[#2F80ED]">
        {number}
      </div>

      <div>
        <p className="font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}