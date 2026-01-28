import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";

export default function AppLayout({ children }) {
  return (
    <>
      <Header />
      <Sidebar />
      <main className="app-content">
        {children}
      </main>
    </>
  );
}