import "./globals.css";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body>
        <div className="app-root">
          <Header />

          <div className="app-body">
            <Sidebar />
            <main className="app-content">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}