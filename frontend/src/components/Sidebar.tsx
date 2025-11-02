import "../styles.css";

export default function Sidebar({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <button className="sidebar-link" onClick={() => onNavigate("mallas")}>
          📚 Mallas
        </button>
        <button className="sidebar-link" onClick={() => onNavigate("planeadores")}>
          📝 Planeadores
        </button>
        <button className="sidebar-link" onClick={() => onNavigate("clases")}>
          🎓 Clases
        </button>
      </nav>
    </aside>
  );
}
