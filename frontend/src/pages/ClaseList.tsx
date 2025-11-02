import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";
import "../styles.css";

export default function ClaseList() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/clases/${user.id}`);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  return (
    <ul className="grid">
      {loading && <p className="text-sm text-gray-600">Cargando...</p>}
      {items.map((c) => (
        <li key={c.id} className="card">
          <h4 className="font-semibold">{c.asignatura} - {c.grado}</h4>
          <p className="status">Tema: {c.tema}</p>
          <p className="text-sm">Objetivos: {c.objetivos}</p>
          {c.contenido && (
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-600">Ver contenido</summary>
              <pre className="bg-gray-100 p-2 text-xs overflow-auto">{JSON.stringify(c.contenido, null, 2)}</pre>
            </details>
          )}
        </li>
      ))}
      {items.length === 0 && !loading && <p className="text-sm text-gray-600">Sin clases registradas.</p>}
    </ul>
  );
}
