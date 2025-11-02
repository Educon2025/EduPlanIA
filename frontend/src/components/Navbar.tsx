import { useAuthStore } from "../store/auth";

type NavbarProps = {
  page: string;
  setPage: (page: string) => void;
};

export default function Navbar({ page, setPage }: NavbarProps) {
  const { logout } = useAuthStore();

  return (
    <nav className="fixed top-[96px] left-0 right-0 bg-blue-900 text-white flex gap-2 px-6 py-2 z-40">
      <button
        className={`btn ${page === "mallas" ? "bg-yellow-400 text-black" : "bg-white text-blue-800"}`}
        onClick={() => setPage("mallas")}
      >
        Mallas
      </button>
      <button
        className={`btn ${page === "planeadores" ? "bg-yellow-400 text-black" : "bg-white text-blue-800"}`}
        onClick={() => setPage("planeadores")}
      >
        Planeadores
      </button>
      <button
        className={`btn ${page === "clases" ? "bg-yellow-400 text-black" : "bg-white text-blue-800"}`}
        onClick={() => setPage("clases")}
      >
        Clases
      </button>
      <button
        className="btn bg-red-600 text-white"
        onClick={logout}
      >
        Cerrar sesión
      </button>
    </nav>
  );
}
