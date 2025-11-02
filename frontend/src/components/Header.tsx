import minticLogo from "../assets/mintic.png";
import udecLogo from "../assets/udec.png";
import eduplanLogo from "../assets/eduplan.png";
import { useAuthStore } from "../store/auth";
import { useState } from "react";
import "../styles.css";

export default function Header({
  onNavigate,
  currentPage
}: {
  onNavigate: (page: string) => void;
  currentPage: string;
}) {
  const { logout } = useAuthStore();
  const [openMenu, setOpenMenu] = useState<null | "mallas" | "planeadores" | "clases">(null);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (menu: "mallas" | "planeadores" | "clases") => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setOpenMenu(menu);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setOpenMenu(null);
    }, 300); // 300ms de delay antes de cerrar
    setCloseTimeout(timeout);
  };

  return (
    <header className="header">
      <div className="header-inner">
        {/* Izquierda: MinTIC */}
        <div className="brand-logos">
          <img src={minticLogo} alt="MinTIC" className="logo" />
        </div>

        {/* Centro: Identidad de la app */}
        <div className="app-identity">
          <img src={eduplanLogo} alt="EduPlan IA" className="app-logo" />
          <h1 className="app-title">EduPlan IA</h1>
          <p className="app-subtitle">
            Bienvenido a la plataforma de planeación curricular inteligente
          </p>

          {/* Menú de navegación */}
          <nav className="nav-menu">
            {/* Mallas */}
            <div
              className="menu-item"
              onMouseEnter={() => handleMouseEnter("mallas")}
              onMouseLeave={handleMouseLeave}
            >
              <button className={`nav-btn nav-btn-green ${currentPage === "mallas" ? "active" : ""}`}>
                📚 Mallas ▾
              </button>
              {openMenu === "mallas" && (
                <div className="submenu">
                  <button onClick={() => onNavigate("mallas")}>
                    Generar Nueva Malla
                  </button>
                  <button onClick={() => onNavigate("historial-mallas")}>
                    Historial de Mallas
                  </button>
                </div>
              )}
            </div>

            {/* Planeadores */}
            <div
              className="menu-item"
              onMouseEnter={() => handleMouseEnter("planeadores")}
              onMouseLeave={handleMouseLeave}
            >
              <button className={`nav-btn nav-btn-yellow ${currentPage === "planeadores" ? "active" : ""}`}>
                📋 Planeadores ▾
              </button>
              {openMenu === "planeadores" && (
                <div className="submenu">
                  <button onClick={() => onNavigate("planeadores")}>
                    Generar Nuevo planeador
                  </button>
                  <button onClick={() => onNavigate("historial-planeadores")}>
                    Historial de Planeadores
                  </button>
                </div>
              )}
            </div>

            {/* Clases */}
            <div
              className="menu-item"
              onMouseEnter={() => handleMouseEnter("clases")}
              onMouseLeave={handleMouseLeave}
            >
              <button className={`nav-btn nav-btn-purple ${currentPage === "clases" ? "active" : ""}`}>
                🎓 Clases ▾
              </button>
              {openMenu === "clases" && (
                <div className="submenu">
                  <button onClick={() => onNavigate("clases")}>
                    Generar Nueva Clase
                  </button>
                  <button onClick={() => onNavigate("historial-clases")}>
                    Historial de Clases
                  </button>
                </div>
              )}
            </div>

            {/* Botón cerrar sesión */}
            <button className="nav-btn nav-btn-red" onClick={logout}>
              ✕ Cerrar sesión
            </button>
          </nav>
        </div>

        {/* Derecha: UniCartagena */}
        <div className="brand-logos">
          <img src={udecLogo} alt="Universidad de Cartagena" className="logo" />
        </div>
      </div>
    </header>
  );
}