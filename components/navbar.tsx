"use client";

import Link from "next/link";

type NavbarProps = {
  farmName: string;
  isOnline: boolean;
};

export default function Navbar({ farmName, isOnline }: NavbarProps) {
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
        <span>{farmName}</span>
      </div>
    </header>
  );
}
