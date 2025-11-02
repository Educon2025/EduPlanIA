import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";

export default function CurriculumList() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/curriculum/${user.id}`);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  return (
    <div>
      <button className="border px-3 py-1 mb-2" onClick={fetchData}>
        Actualizar
      </button>
      {loading && <p className="text-sm text-gray-600">Cargando...</p>}
      <ul className="space-y-2">
        {items.map((c) => (
          <li key={c.id} className="border rounded p-3 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{c.asignatura} - {c.grado}</div>
                <div className="text-sm text-gray-600">Periodos: {c.periodos} • Nivel: {c.nivel} • Año: {c.anio}</div>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(c.contenido, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `malla_${c.asignatura}_${c.grado}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Exportar
                </button>
              </div>
            </div>
            <details className="mt-1">
              <summary className="cursor-pointer text-blue-600">Ver contenido</summary>
              <pre className="bg-gray-100 p-2 text-xs overflow-auto">{JSON.stringify(c.contenido, null, 2)}</pre>
            </details>
          </li>
        ))}
        {items.length === 0 && !loading && <p className="text-sm text-gray-600">Sin mallas registradas.</p>}
      </ul>
    </div>
  );
}
