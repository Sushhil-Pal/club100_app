import {
  useEffect,
  useRef,
} from "react";

import {
  markPwaInstalled,
} from "../../services/authService";

import {
  usePwaInstall,
} from "../../hooks/usePwaInstall";

export default function PwaInstallationTracker() {
  const {
    isInstalled,
  } = usePwaInstall();

  const reportedRef =
    useRef(false);

  useEffect(() => {
    if (
      !isInstalled ||
      reportedRef.current
    ) {
      return;
    }

    reportedRef.current =
      true;

    void markPwaInstalled()
      .catch((error) => {
        /*
         * Allow another attempt during this
         * app session if reporting failed.
         */
        reportedRef.current =
          false;

        console.error(
          "Could not record PWA installation.",
          error
        );
      });
  }, [
    isInstalled,
  ]);

  return null;
}