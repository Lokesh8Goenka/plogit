export type Tab = "home" | "profile";

export function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="nav">
      <button className={`nav__btn ${active === "home" ? "nav__btn--on" : ""}`} onClick={() => onChange("home")}>
        <span className="nav__icon">📷</span>
        <span className="nav__label">Plog</span>
      </button>
      <button className={`nav__btn ${active === "profile" ? "nav__btn--on" : ""}`} onClick={() => onChange("profile")}>
        <span className="nav__icon">🌿</span>
        <span className="nav__label">Profile</span>
      </button>
    </nav>
  );
}
