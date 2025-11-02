import CurriculumForm from "./CurriculumForm";
import PlaneadorForm from "./PlaneadorForm";
import ClaseForm from "./ClaseForm";
import { useAuthStore } from "../store/auth";
import "../styles.css";

export default function Dashboard({ page }: { page: string }) {
  const { user } = useAuthStore();
  
  return (
    <div className="w-full pt-8">
      {/* Página Mallas - Formulario normal */}
      {page === "mallas" && (
        <div className="w-full max-w-6xl mx-auto px-4 pt-8">
          <CurriculumForm showHistorialInitially={false} />
        </div>
      )}

      {/* Página Historial de Mallas - Muestra historial automáticamente */}
      {page === "historial-mallas" && (
        <div className="w-full max-w-6xl mx-auto px-4 pt-8">
          <CurriculumForm showHistorialInitially={true} />
        </div>
      )}

      {/* Página Planeadores - Formulario normal */}
      {page === "planeadores" && (
        <div className="w-full max-w-6xl mx-auto px-4 pt-8">
          <PlaneadorForm showHistorialInitially={false} />
        </div>
      )}

      {/* Página Historial de Planeadores - Muestra historial automáticamente */}
      {page === "historial-planeadores" && (
        <div className="w-full max-w-6xl mx-auto px-4 pt-8">
          <PlaneadorForm showHistorialInitially={true} />
        </div>
      )}


      {/* Página Clases - Formulario normal */}
      {page === "clases" && (
        <div className="w-full max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white shadow-sm rounded-lg p-6 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Bienvenido, {user?.name}
            </h2>
          </div>
          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Nueva clase</h3>
            <ClaseForm showHistorialInitially={false} />
          </div>
        </div>
      )}

      {/* Página Historial de Clases - Muestra historial automáticamente */}
      {page === "historial-clases" && (
        <div className="w-full max-w-6xl mx-auto px-4 pt-8">
          <ClaseForm showHistorialInitially={true} />
        </div>
      )}
    </div>
  );
}