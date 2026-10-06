import {
  Outlet,
} from "react-router-dom";

import MobileHeader from "./MobileHeader";

import BottomNavigation from "../navigation/BottomNavigation";

import DesktopSidebar from "../navigation/DesktopSidebar";

import InstallAppBanner from "../pwa/InstallAppBanner";

import PwaInstallationTracker from "../pwa/PwaInstallationTracker";

import PushNotificationPrompt from "../push/PushNotificationPrompt";

export default function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PwaInstallationTracker />

      <MobileHeader />

      <div className="mx-auto flex max-w-7xl">
        <DesktopSidebar />

        <main className="min-h-screen flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-8">
          <InstallAppBanner />

          <PushNotificationPrompt />

          <Outlet />
        </main>
      </div>

      <BottomNavigation />
    </div>
  );
}