import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

type InstallChoice = {
  outcome:
    | "accepted"
    | "dismissed";

  platform: string;
};

interface BeforeInstallPromptEvent
  extends Event {
  prompt: () => Promise<void>;

  userChoice:
    Promise<InstallChoice>;
}

type PwaInstallContextValue = {
  isInstalled: boolean;
  isIOS: boolean;
  canInstall: boolean;

  install: () =>
    Promise<boolean>;
};

const PwaInstallContext =
  createContext<
    PwaInstallContextValue | undefined
  >(undefined);

function isStandaloneMode() {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }

  const displayModeStandalone =
    window.matchMedia(
      "(display-mode: standalone)"
    ).matches;

  const navigatorStandalone =
    Boolean(
      (
        navigator as Navigator & {
          standalone?: boolean;
        }
      ).standalone
    );

  return (
    displayModeStandalone ||
    navigatorStandalone
  );
}

function detectIOS() {
  if (
    typeof navigator ===
    "undefined"
  ) {
    return false;
  }

  const userAgent =
    navigator.userAgent;

  const classicIOS =
    /iPad|iPhone|iPod/i.test(
      userAgent
    );

  const modernIPad =
    navigator.platform ===
      "MacIntel" &&
    navigator.maxTouchPoints > 1;

  return (
    classicIOS ||
    modernIPad
  );
}

export function PwaInstallProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    deferredPrompt,
    setDeferredPrompt,
  ] =
    useState<
      BeforeInstallPromptEvent | null
    >(null);

  const [
    isInstalled,
    setIsInstalled,
  ] = useState(
    isStandaloneMode
  );

  const isIOS =
    useMemo(
      () => detectIOS(),
      []
    );

  useEffect(() => {
    function handleBeforeInstallPrompt(
      event: Event
    ) {
      event.preventDefault();

      setDeferredPrompt(
        event as
          BeforeInstallPromptEvent
      );
    }

    function handleAppInstalled() {
      setIsInstalled(
        true
      );

      setDeferredPrompt(
        null
      );
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      handleAppInstalled
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );
    };
  }, []);

  const install =
    useCallback(async () => {
      if (
        !deferredPrompt
      ) {
        return false;
      }

      await deferredPrompt.prompt();

      const choice =
        await deferredPrompt.userChoice;

      if (
        choice.outcome ===
        "accepted"
      ) {
        setDeferredPrompt(
          null
        );

        return true;
      }

      // If the browser's native install
      // dialog is cancelled, keep the
      // deferred prompt reference so the
      // Club100 banner remains available.
      return false;
    }, [
      deferredPrompt,
    ]);

  const value =
    useMemo<
      PwaInstallContextValue
    >(
      () => ({
        isInstalled,
        isIOS,

        canInstall:
          Boolean(
            deferredPrompt
          ),

        install,
      }),
      [
        isInstalled,
        isIOS,
        deferredPrompt,
        install,
      ]
    );

  return (
    <PwaInstallContext.Provider
      value={value}
    >
      {children}
    </PwaInstallContext.Provider>
  );
}

export function usePwaInstall() {
  const context =
    useContext(
      PwaInstallContext
    );

  if (!context) {
    throw new Error(
      "usePwaInstall must be used inside PwaInstallProvider."
    );
  }

  return context;
}