import "./globals.css";
import KeycloakProvider from "@/components/providers/KeycloakProvider";

export const metadata = {
  title: "Animal Help App — SPA",
};

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
        <KeycloakProvider>
          {children}
        </KeycloakProvider>
      </body>
    </html>
  );
}
