"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type NavbarProps = {
  farmName: string;
  isOnline: boolean;
};

export default function Navbar({ farmName, isOnline }: NavbarProps) {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    api
      .get<{ name: string }>("/auth/me")
      .then(({ data }) => setUserName(data.name))
      .catch(() => setUserName(null));
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await api.post("/auth/logout");
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <header className="topbar">
      <Link href="/dashboard" className="brandRow" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="brandMark">G</div>
        <strong>GAIA</strong>
      </Link>

      <nav className="navTabs" aria-label="Main navigation">
        <Link href="/dashboard" className="navTab active">
          Your fields
        </Link>
      </nav>

      <div className="farmSelector">
        <span className={`liveDot ${isOnline ? "online" : ""}`} />
        <span>{userName ? `${userName} · ${farmName}` : farmName}</span>
        <button type="button" className="logoutButton" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Logging out…" : "Log out"}
        </button>
      </div>
    </header>
  );
}
