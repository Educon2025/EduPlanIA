import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";
import "../styles.css";

export default function PlaneadorList() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/planeadores/${user.id}`);
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
      <button className="border px-3 py-1 mb-2" onClick={fetchData}>Actualizar</button>
      {loading && <p className="text-sm text-gray-600">Cargando...</p>}
      <ul className="grid">
        {items.map((p) => (
          <li key={p.id} className="card">
            <h4 className="font-semibold">{p.asignatura} - {p.grado}</h4>
            <p className="status">Periodo {p.periodo}</p>
            <p className="text-sm">{p.tema}</p>
            {p.contenido && (
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-600">Ver contenido</summary>
                <pre className="bg-gray-100 p-2 text-xs overflow-auto">{JSON.stringify(p.contenido, null, 2)}</pre>
              </details>
            )}
          </li>
        ))}
        {items.length === 0 && !loading && <p className="text-sm text-gray-600">Sin planeadores registrados.</p>}
      </ul>
    </div>
  );
}
