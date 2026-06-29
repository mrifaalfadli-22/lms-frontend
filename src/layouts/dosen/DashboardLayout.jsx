import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { ProfileProvider } from "../../hooks/useProfile";

export default function DosenDashboardLayout() {
  return (
    <ProfileProvider>
      <div className="flex bg-[#F0F4F3] h-screen overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-10 pt-7 pt-8 pb-9">
            <Header />
          </div>

          {/* Konten scroll */}
          <main className="flex-1 px-10 pb-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ProfileProvider>
  );
}
