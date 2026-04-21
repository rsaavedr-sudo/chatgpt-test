"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const linkStyle = (path: string) => ({
    display: "block",
    padding: "10px 14px",
    borderRadius: 8,
    marginBottom: 6,
    textDecoration: "none",
    background: pathname === path ? "#111" : "transparent",
    color: pathname === path ? "#fff" : "#333",
    fontWeight: 500,
  });

  return (
    <aside
      style={{
        width: 240,
        height: "100vh",
        borderRight: "1px solid #e5e7eb",
        padding: 20,
        boxSizing: "border-box",
        background: "#fff",
      }}
    >
      {/* 🔥 Branding */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 4, letterSpacing: 1 }}>
          ⋮⋯⋮ Flow360 AI
        </h2>
        <p style={{ fontSize: 12, color: "#666", marginTop: 0 }}>
          Communication OS
        </p>
      </div>

      {/* 📌 Navigation */}
      <nav style={{ marginTop: 20 }}>
        <Link href="/" style={linkStyle("/")}>
          🧪 Test
        </Link>

        <Link href="/agents" style={linkStyle("/agents")}>
          🤖 Agents
        </Link>
      </nav>
    </aside>
  );
}
