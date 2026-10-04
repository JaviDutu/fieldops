"use client";

type NavbarProps = {
  farmName: string;
  isOnline: boolean;
};

export default function Navbar({ farmName, isOnline }: NavbarProps) {
  return (
    <header className="topbar">
      <div className="brandRow">
        <div className="brandMark">F</div>
        <strong>FieldOps</strong>
      </div>

      <nav className="navTabs" aria-label="Main navigation">
        <button className="navTab active">Today</button>
        <button className="navTab">Fields</button>
        <button className="navTab">Sources</button>
      </nav>

      <div className="farmSelector">
        <span className={`liveDot ${isOnline ? "online" : ""}`} />
        <span>{farmName}</span>
      </div>
    </header>
  );
}