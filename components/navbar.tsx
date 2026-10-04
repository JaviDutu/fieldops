"use client";

import Link from "next/link";

type NavbarProps = {
  farmName: string;
  isOnline: boolean;
  activeTab?: "today" | "fields" | "sources";
};

export default function Navbar({ farmName, isOnline, activeTab = "today" }: NavbarProps) {
  return (
    <header className="topbar">
      <Link href="/" className="brandRow" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="brandMark">D</div>
        <strong>DEMETER</strong>
      </Link>

      <nav className="navTabs" aria-label="Main navigation">
        <Link
          href="/field"
          className={`navTab ${activeTab === "today" ? "active" : ""}`}
        >
          Today
        </Link>
        <span className={`navTab ${activeTab === "fields" ? "active" : ""}`} aria-disabled>
          Fields
        </span>
        <span className={`navTab ${activeTab === "sources" ? "active" : ""}`} aria-disabled>
          Sources
        </span>
      </nav>

      <div className="farmSelector">
        <span className={`liveDot ${isOnline ? "online" : ""}`} />
        <span>{farmName}</span>
      </div>
    </header>
  );
}
