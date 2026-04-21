import "./globals.css";
import Sidebar from "./components/Sidebar";

export const metadata = {
  title: "Flow360 AI",
  description: "Plataforma inteligente de automação e agentes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body style={{ margin: 0, display: "flex" }}>
        <Sidebar />
        <div style={{ flex: 1 }}>{children}</div>
      </body>
    </html>
  );
}
