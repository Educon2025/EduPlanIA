import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";

type NivelClave = "preescolar" | "primaria" | "secundaria";

const GRADOS_POR_NIVEL: Record<NivelClave, string[]> = {
  preescolar: ["Prejardín", "Jardín", "Transición"],
  primaria: ["Primero", "Segundo", "Tercero", "Cuarto", "Quinto"],
  secundaria: ["Sexto", "Séptimo", "Octavo", "Noveno", "Décimo", "Undécimo"]
};

const ASIGNATURAS_BASE = [
  "Ciencias Naturales",
  "Lengua Castellana",
  "Matemáticas",
  "Ciencias Sociales",
  "Tecnología e Informática",
  "Inglés",
  "Educación Artística",
  "Educación Física",
  "Ética y Valores"
];

export default function CurriculumForm({ showHistorialInitially = false }: { showHistorialInitially?: boolean }) {
  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState({
    nivel: "primaria" as NivelClave,
    grado: "Tercero",
    asignatura: "Ciencias Naturales",
    edades: "8-9 años",
    periodos: 4,
    anio: new Date().getFullYear()
  });

  const [preview, setPreview] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(0);

  const [showHistorial, setShowHistorial] = useState(showHistorialInitially);
  const [historial, setHistorial] = useState<any[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const gradosDisponibles = useMemo(() => GRADOS_POR_NIVEL[form.nivel], [form.nivel]);

  useEffect(() => {
    if (!gradosDisponibles.includes(form.grado)) {
      setForm((f) => ({ ...f, grado: gradosDisponibles[0] }));
    }
  }, [form.nivel]);

  // Cargar historial automáticamente si showHistorialInitially es true
  useEffect(() => {
    if (showHistorialInitially) {
      fetchHistorial();
    }
  }, [showHistorialInitially]);

  async function generateWithAI() {
    setStatus(null);
    setLoading(true);
    setPreview(null);
    setSelectedPeriod(0);
    setShowHistorial(false);
    try {
      const { data } = await api.post("/curriculum/generar", form);
      setPreview(data.contenido);
      setStatus("✅ Malla generada exitosamente");
    } catch (err: any) {
      setStatus("❌ " + (err?.response?.data?.error || "Error al generar con IA"));
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!preview) return;
    setLoading(true);
    setStatus(null);
    try {
      const { data } = await api.post("/curriculum", {
        userId: user?.id,
        ...form,
        contenido: preview
      });
      setStatus(`✅ Malla guardada con ID ${data.id}`);
      alert("✅ Malla guardada correctamente");
      if (showHistorial) {
        fetchHistorial();
      }
    } catch (err: any) {
      setStatus("❌ " + (err?.response?.data?.error || "Error al guardar malla"));
    } finally {
      setLoading(false);
    }
  }

  async function deleteMalla(id: number) {
    if (!confirm("¿Seguro que deseas eliminar esta malla?")) return;
    try {
      await api.delete(`/curriculum/${id}`);
      setHistorial((prev) => prev.filter((m) => m.id !== id));
      alert("🗑️ Malla eliminada correctamente");
    } catch {
      alert("❌ Error al eliminar la malla");
    }
  }

  function verMalla(malla: any) {
    setPreview(malla.contenido);
    setForm({
      nivel: malla.nivel,
      grado: malla.grado,
      asignatura: malla.asignatura,
      edades: malla.edades || "8-9 años",
      periodos: malla.periodos || 4,
      anio: malla.anio || new Date().getFullYear()
    });
    setSelectedPeriod(0);
    setShowHistorial(false);
    setStatus(`📄 Visualizando malla ID: ${malla.id}`);
  }

  function exportPDF(content: any, asignatura: string, grado: string, id?: number) {
    if (!content) return;
    
    const contenidoReal = content.contenido || content;
    
    let texto = `MALLA CURRICULAR\n\nAsignatura: ${asignatura || contenidoReal.asignatura}\nGrado: ${grado || contenidoReal.grado}\n\n`;
    
    const periodos = contenidoReal.periodos || [];
    
    periodos.forEach((p: any, i: number) => {
      texto += `========== PERIODO ${i + 1} ==========\n\n`;
      if (p.estandares) texto += `Estándares:\n${toLine(p.estandares)}\n\n`;
      if (p.dba) texto += `DBA:\n${toLine(p.dba)}\n\n`;
      if (p.competencias) texto += `Competencias:\n${toLine(p.competencias)}\n\n`;
      if (p.indicadores) texto += `Indicadores:\n${toLine(p.indicadores)}\n\n`;
      if (p.contenidos) texto += `Contenidos:\n${toLine(p.contenidos)}\n\n`;
      if (p.estrategiasMetodologicas || p.estrategias) texto += `Estrategias:\n${toLine(p.estrategiasMetodologicas || p.estrategias)}\n\n`;
      if (p.recursos) texto += `Recursos:\n${toLine(p.recursos)}\n\n`;
      if (p.evaluacion) texto += `Evaluación:\n${toLine(p.evaluacion.criterios || p.evaluacion)}\n\n`;
    });
    
    const filename = id ? `malla_${asignatura}_${grado}_ID${id}.txt` : `malla_${asignatura}_${grado}.txt`;
    
    const blob = new Blob([texto], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportWord(content: any, asignatura: string, grado: string, id?: number) {
    if (!content) return;
    
    const contenidoReal = content.contenido || content;
    
    let html = `
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #2c3e50; }
        h2 { color: #34495e; margin-top: 30px; }
        h3 { color: #7f8c8d; }
        ul { margin: 10px 0; }
        li { margin: 5px 0; }
      </style></head><body>
      <h1>MALLA CURRICULAR</h1>
      <p><b>Asignatura:</b> ${asignatura || contenidoReal.asignatura}</p>
      <p><b>Grado:</b> ${grado || contenidoReal.grado}</p>
    `;
    
    const periodos = contenidoReal.periodos || [];
    
    periodos.forEach((p: any, i: number) => {
      html += `<h2>Periodo ${i + 1}</h2>`;
      if (p.estandares) html += sectionList("Estándares", p.estandares);
      if (p.dba) html += sectionList("DBA", p.dba);
      if (p.competencias) html += sectionList("Competencias", p.competencias);
      if (p.indicadores) html += sectionList("Indicadores de desempeño", p.indicadores);
      if (p.contenidos) html += sectionList("Contenidos", p.contenidos);
      if (p.estrategiasMetodologicas || p.estrategias) html += sectionList("Estrategias metodológicas", p.estrategiasMetodologicas || p.estrategias);
      if (p.recursos) html += sectionList("Recursos didácticos", p.recursos);
      if (p.evaluacion) html += sectionList("Evaluación", p.evaluacion.criterios || p.evaluacion);
    });
    
    html += "</body></html>";
    
    const filename = id ? `malla_${asignatura}_${grado}_ID${id}.doc` : `malla_${asignatura}_${grado}.doc`;
    
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function toggleHistorial() {
    const nuevoEstado = !showHistorial;
    setShowHistorial(nuevoEstado);
    if (nuevoEstado) {
      fetchHistorial();
    }
  }

  async function fetchHistorial() {
    setLoadingHistorial(true);
    try {
      const { data } = await api.get(`/curriculum/user/${user?.id}`);
      console.log("Historial recibido:", data);
      setHistorial(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar historial:", error);
      setHistorial([]);
    } finally {
      setLoadingHistorial(false);
    }
  }

  return (
    <div className="w-full relative">
      {/* Barra superior - Solo visible cuando NO es vista de historial inicial */}
      {!showHistorialInitially && (
        <div className="flex flex-wrap gap-2 mb-4 items-center bg-white border-b sticky top-0 z-50 p-2">
          {preview?.periodos?.map((p: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setSelectedPeriod(idx)}
              className={`btn ${selectedPeriod === idx ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
            >
              {`Periodo ${idx + 1}`}
            </button>
          ))}

          {preview && (
            <>
              <button onClick={save} className="btn bg-green-600 text-white">
                Guardar malla
              </button>
              <button 
                onClick={() => exportPDF(preview, form.asignatura, form.grado)} 
                className="btn bg-gray-200 text-gray-800"
              >
                📄 PDF
              </button>
              <button 
                onClick={() => exportWord(preview, form.asignatura, form.grado)} 
                className="btn bg-gray-200 text-gray-800"
              >
                📝 Word
              </button>
            </>
          )}
          
          <button onClick={toggleHistorial} className="btn bg-blue-500 text-white">
            📂 {showHistorial ? "Cerrar historial" : "Historial de mallas"}
          </button>
        </div>
      )}

      {/* Formulario - Solo visible cuando NO hay preview Y NO hay historial */}
      {!preview && !showHistorial && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={form.nivel} onChange={(e) => setForm({ ...form, nivel: e.target.value as NivelClave })}>
              <option value="preescolar">Preescolar</option>
              <option value="primaria">Básica Primaria</option>
              <option value="secundaria">Secundaria y Media</option>
            </select>

            <select value={form.grado} onChange={(e) => setForm({ ...form, grado: e.target.value })}>
              {gradosDisponibles.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>

            <select value={form.asignatura} onChange={(e) => setForm({ ...form, asignatura: e.target.value })}>
              {ASIGNATURAS_BASE.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>

            <input
              value={form.edades}
              onChange={(e) => setForm({ ...form, edades: e.target.value })}
              placeholder="Edades"
            />

            <input
              type="number"
              value={form.periodos}
              onChange={(e) => setForm({ ...form, periodos: Number(e.target.value) })}
            />

            <input
              type="number"
              value={form.anio}
              onChange={(e) => setForm({ ...form, anio: Number(e.target.value) })}
            />
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={generateWithAI}
              disabled={loading}
              className="btn w-full bg-blue-600 text-white"
            >
              {loading ? "⏳ Generando..." : "✨ Generar malla con IA"}
            </button>
          </div>

          {status && <p className="mt-2 text-sm">{status}</p>}
        </div>
      )}

      <div className="flex gap-4">
        {/* Vista previa */}
        {preview && !showHistorial && (
          <div className="w-full bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-2">
              {preview.asignatura} - {preview.grado}
            </h3>
            <h4 className="text-md font-medium text-gray-600 mb-4">
              {`Periodo ${selectedPeriod + 1} de ${preview.periodos.length}`}
            </h4>
            <PeriodoView periodo={preview.periodos[selectedPeriod]} />
            {status && <p className="mt-2 text-sm">{status}</p>}
          </div>
        )}

        {/* Panel de Historial */}
        {showHistorial && (
          <div className="w-full bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">📚 Historial de Mallas Curriculares</h3>
              {!showHistorialInitially && (
                <button 
                  onClick={() => setShowHistorial(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold px-3 py-1 hover:bg-gray-100 rounded"
                >
                  ✕
                </button>
              )}
            </div>
            
            {loadingHistorial ? (
              <div className="text-center py-8">
                <p className="text-lg text-gray-600">⏳ Cargando historial...</p>
              </div>
            ) : historial.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-lg text-gray-600 mb-2">📭 No hay mallas guardadas</p>
                <p className="text-sm text-gray-500">Crea tu primera malla curricular para verla aquí</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {historial.map((malla: any) => (
                  <HistorialCard
                    key={malla.id}
                    item={malla}
                    onExportPDF={() => exportPDF(malla, malla.asignatura, malla.grado, malla.id)}
                    onExportWord={() => exportWord(malla, malla.asignatura, malla.grado, malla.id)}
                    onVerMalla={() => verMalla(malla)}
                    onDelete={() => deleteMalla(malla.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   Componentes auxiliares
   ========================= */

function PeriodoView({ periodo }: { periodo: any }) {
  return (
    <div className="space-y-6">
      <CardSection title="Estándares (MEN)">
        <BulletList items={periodo.estandares} />
      </CardSection>
      <CardSection title="Derechos Básicos de Aprendizaje (DBA)">
        <BulletList items={periodo.dba} />
      </CardSection>
      <CardSection title="Competencias">
        <BulletList items={periodo.competencias} />
      </CardSection>
      <CardSection title="Indicadores de desempeño">
        <BulletList items={periodo.indicadores} />
      </CardSection>
      <CardSection title="Contenidos por ejes">
        <BulletList items={periodo.contenidos} />
      </CardSection>
      <CardSection title="Estrategias metodológicas">
        <BulletList items={periodo.estrategiasMetodologicas ?? periodo.estrategias} />
      </CardSection>
      <CardSection title="Recursos didácticos">
        <BulletList items={periodo.recursos} />
      </CardSection>
      <CardSection title="Evaluación">
        <BulletList items={periodo.evaluacion?.criterios} />
      </CardSection>
    </div>
  );
}

function CardSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t pt-4">
      <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
      {children}
    </section>
  );
}

function BulletList({ items }: { items?: any }) {
  if (!items) {
    return <p className="text-sm text-gray-600">Sin información</p>;
  }

  if (typeof items === "string") {
    return (
      <ul className="space-y-2">
        <li className="flex items-start gap-2 text-gray-800 text-sm">
          <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-500" />
          <span>{items}</span>
        </li>
      </ul>
    );
  }

  if (!Array.isArray(items) && typeof items === "object") {
    items = Object.values(items);
  }

  if (Array.isArray(items) && items.length > 0) {
    return (
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-800 text-sm">
            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-500" />
            <span>{String(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  return <p className="text-sm text-gray-600">Sin información</p>;
}

function HistorialCard({
  item,
  onExportPDF,
  onExportWord,
  onVerMalla,
  onDelete
}: {
  item: any;
  onExportPDF: () => void;
  onExportWord: () => void;
  onVerMalla: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border-2 border-gray-200 p-5 bg-white hover:shadow-lg transition-all duration-200 hover:border-blue-400">
      <div className="mb-4">
        <h4 className="font-bold text-lg text-gray-800 mb-1">
          {item.asignatura}
        </h4>
        <p className="text-sm text-gray-600 mb-1">
          📚 Grado: {item.grado}
        </p>
        <p className="text-xs text-gray-500">
          🏫 {item.nivel} • 📅 Año: {item.anio ?? "—"} • 🆔 ID: {item.id}
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={onVerMalla} 
          className="btn bg-blue-600 text-white text-sm py-2 px-4 hover:bg-blue-700 transition-colors"
        >
          👁️ Ver Malla
        </button>
        
        <button 
          onClick={onExportPDF} 
          className="btn bg-blue-600 text-white text-sm py-2 px-4 hover:bg-blue-700 transition-colors"
        >
          📄 PDF
        </button>
        
        <button 
          onClick={onExportWord} 
          className="btn bg-blue-600 text-white text-sm py-2 px-4 hover:bg-blue-700 transition-colors"
        >
          📝 Word
        </button>
        
        <button 
          onClick={onDelete} 
          className="btn bg-blue-600 text-white text-sm py-2 px-4 hover:bg-blue-700 transition-colors"
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
}

/* =========================
   Utilidades
   ========================= */

function toArray(v: any): any[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === "object") return Object.values(v);
  return [String(v)];
}

function toLine(v: any): string {
  return toArray(v).join(", ");
}

function sectionList(titulo: string, v: any): string {
  const arr = toArray(v);
  if (arr.length === 0) return "";
  let html = `<h3>${titulo}</h3><ul>`;
  arr.forEach((x) => {
    html += `<li>${String(x)}</li>`;
  });
  html += `</ul>`;
  return html;
}