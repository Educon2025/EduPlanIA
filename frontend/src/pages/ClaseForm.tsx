import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";
import "../styles.css";

export default function ClaseForm({ showHistorialInitially = false }: { showHistorialInitially?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({
    asignatura: "Matemáticas",
    grado: "3°",
    tema: "",
    objetivos: ""
  });
  const [preview, setPreview] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showHistorial, setShowHistorial] = useState(showHistorialInitially);
  const [historial, setHistorial] = useState<any[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Cargar historial automáticamente si showHistorialInitially es true
  useEffect(() => {
    if (showHistorialInitially) {
      fetchHistorial();
    }
  }, [showHistorialInitially]);

  async function save() {
    if (!preview) return;
    setStatus("Guardando...");
    setLoading(true);
    try {
      const { data } = await api.post("/clases", { 
        userId: user?.id, 
        ...form, 
        contenido: preview 
      });
      setStatus(`✅ Clase guardada con id ${data.id}`);
      alert("✅ Clase guardada correctamente");
      if (showHistorial) {
        fetchHistorial();
      }
    } catch {
      setStatus("❌ Error al guardar clase");
    } finally {
      setLoading(false);
    }
  }

  async function generateWithAI() {
    setStatus("⏳ Generando con IA...");
    setLoading(true);
    setPreview(null);
    setShowHistorial(false);
    try {
      const { data } = await api.post("/clases/generar", { 
        asignatura: form.asignatura, 
        grado: form.grado, 
        tema: form.tema 
      });
      setPreview(data.contenido);
      setStatus("✅ Clase generada con IA");
    } catch (e: any) {
      setStatus(e?.response?.data?.error || "❌ Error al generar con IA");
    } finally {
      setLoading(false);
    }
  }

  async function deleteClase(id: number) {
    if (!confirm("¿Seguro que deseas eliminar esta clase?")) return;
    try {
      await api.delete(`/clases/${id}`);
      setHistorial((prev) => prev.filter((c) => c.id !== id));
      alert("🗑️ Clase eliminada correctamente");
    } catch {
      alert("❌ Error al eliminar la clase");
    }
  }

  function verClase(clase: any) {
    setPreview(clase.contenido);
    setForm({
      asignatura: clase.asignatura,
      grado: clase.grado,
      tema: clase.tema || "",
      objetivos: clase.objetivos || ""
    });
    setShowHistorial(false);
    setStatus(`📄 Visualizando clase ID: ${clase.id}`);
  }

  function exportPDF(content: any, asignatura: string, grado: string, tema: string, id?: number) {
    if (!content) return;
    
    const contenidoReal = content.contenido || content;
    
    let contenidoPDF = `PLANEACIÓN DE CLASE\n\n`;
    contenidoPDF += `Asignatura: ${asignatura || contenidoReal.asignatura}\n`;
    contenidoPDF += `Grado: ${grado || contenidoReal.grado}\n`;
    contenidoPDF += `Tema: ${tema || contenidoReal.tema}\n`;
    contenidoPDF += `Duración: ${contenidoReal.duracion || "45-60 minutos"}\n\n`;
    
    if (contenidoReal.estandar) {
      contenidoPDF += `ESTÁNDAR (MEN):\n${contenidoReal.estandar}\n\n`;
    }
    
    if (contenidoReal.dba) {
      contenidoPDF += `DBA:\n${contenidoReal.dba}\n\n`;
    }
    
    if (contenidoReal.objetivos) {
      contenidoPDF += `OBJETIVOS:\n`;
      const obj = Array.isArray(contenidoReal.objetivos) ? contenidoReal.objetivos : [contenidoReal.objetivos];
      obj.forEach((o: string, i: number) => contenidoPDF += `${i + 1}. ${o}\n`);
      contenidoPDF += `\n`;
    }
    
    if (contenidoReal.competencias) {
      contenidoPDF += `COMPETENCIAS:\n`;
      const comp = Array.isArray(contenidoReal.competencias) ? contenidoReal.competencias : [contenidoReal.competencias];
      comp.forEach((c: string, i: number) => contenidoPDF += `${i + 1}. ${c}\n`);
      contenidoPDF += `\n`;
    }
    
    if (contenidoReal.actividades) {
      contenidoPDF += `ACTIVIDADES:\n\n`;
      
      if (contenidoReal.actividades.inicio) {
        contenidoPDF += `INICIO (${contenidoReal.actividades.inicio.duracion || "15 min"}):\n`;
        const inicio = contenidoReal.actividades.inicio.actividades || contenidoReal.actividades.inicio;
        const actInicio = Array.isArray(inicio) ? inicio : [inicio];
        actInicio.forEach((a: string, i: number) => contenidoPDF += `  ${i + 1}. ${a}\n`);
        contenidoPDF += `\n`;
      }
      
      if (contenidoReal.actividades.desarrollo) {
        contenidoPDF += `DESARROLLO (${contenidoReal.actividades.desarrollo.duracion || "30-35 min"}):\n`;
        const desarrollo = contenidoReal.actividades.desarrollo.actividades || contenidoReal.actividades.desarrollo;
        const actDesarrollo = Array.isArray(desarrollo) ? desarrollo : [desarrollo];
        actDesarrollo.forEach((a: string, i: number) => contenidoPDF += `  ${i + 1}. ${a}\n`);
        contenidoPDF += `\n`;
      }
      
      if (contenidoReal.actividades.cierre) {
        contenidoPDF += `CIERRE (${contenidoReal.actividades.cierre.duracion || "10 min"}):\n`;
        const cierre = contenidoReal.actividades.cierre.actividades || contenidoReal.actividades.cierre;
        const actCierre = Array.isArray(cierre) ? cierre : [cierre];
        actCierre.forEach((a: string, i: number) => contenidoPDF += `  ${i + 1}. ${a}\n`);
        contenidoPDF += `\n`;
      }
    }
    
    if (contenidoReal.estrategiasDidacticas || contenidoReal.estrategias) {
      contenidoPDF += `ESTRATEGIAS DIDÁCTICAS:\n`;
      const estrategias = contenidoReal.estrategiasDidacticas || contenidoReal.estrategias;
      const est = Array.isArray(estrategias) ? estrategias : [estrategias];
      est.forEach((e: string, i: number) => contenidoPDF += `${i + 1}. ${e}\n`);
      contenidoPDF += `\n`;
    }
    
    if (contenidoReal.recursos) {
      contenidoPDF += `RECURSOS:\n`;
      const rec = Array.isArray(contenidoReal.recursos) ? contenidoReal.recursos : [contenidoReal.recursos];
      rec.forEach((r: string, i: number) => contenidoPDF += `${i + 1}. ${r}\n`);
      contenidoPDF += `\n`;
    }
    
    if (contenidoReal.evaluacion) {
      contenidoPDF += `EVALUACIÓN:\n`;
      if (contenidoReal.evaluacion.criterios) {
        contenidoPDF += `Criterios:\n`;
        contenidoReal.evaluacion.criterios.forEach((c: string, i: number) => contenidoPDF += `  ${i + 1}. ${c}\n`);
      }
      if (contenidoReal.evaluacion.instrumentos) {
        contenidoPDF += `Instrumentos:\n`;
        contenidoReal.evaluacion.instrumentos.forEach((inst: string, i: number) => contenidoPDF += `  ${i + 1}. ${inst}\n`);
      }
    }
    
    const filename = id 
      ? `clase_${asignatura}_${grado}_ID${id}.txt`
      : `clase_${asignatura}_${grado}.txt`;
    
    const blob = new Blob([contenidoPDF], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportWord(content: any, asignatura: string, grado: string, tema: string, id?: number) {
    if (!content) return;
    
    const contenidoReal = content.contenido || content;
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Planeación de Clase</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #0b2e59; text-align: center; }
          h2 { color: #1f5aa6; margin-top: 20px; border-bottom: 2px solid #1f5aa6; }
          h3 { color: #143e73; margin-top: 15px; }
          .info { background-color: #f5f7fb; padding: 15px; margin-bottom: 20px; border-left: 4px solid #1f5aa6; }
          ul { margin: 10px 0; }
          li { margin: 5px 0; }
          .section { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>PLANEACIÓN DE CLASE</h1>
        <div class="info">
          <p><strong>Asignatura:</strong> ${asignatura || contenidoReal.asignatura}</p>
          <p><strong>Grado:</strong> ${grado || contenidoReal.grado}</p>
          <p><strong>Tema:</strong> ${tema || contenidoReal.tema}</p>
          <p><strong>Duración:</strong> ${contenidoReal.duracion || "45-60 minutos"}</p>
        </div>
    `;
    
    if (contenidoReal.estandar) {
      htmlContent += `<div class="section"><h2>ESTÁNDAR (MEN)</h2><p>${contenidoReal.estandar}</p></div>`;
    }
    
    if (contenidoReal.dba) {
      htmlContent += `<div class="section"><h2>DBA</h2><p>${contenidoReal.dba}</p></div>`;
    }
    
    if (contenidoReal.objetivos) {
      htmlContent += `<div class="section"><h2>OBJETIVOS</h2><ul>`;
      const obj = Array.isArray(contenidoReal.objetivos) ? contenidoReal.objetivos : [contenidoReal.objetivos];
      obj.forEach((o: string) => htmlContent += `<li>${o}</li>`);
      htmlContent += `</ul></div>`;
    }
    
    if (contenidoReal.competencias) {
      htmlContent += `<div class="section"><h2>COMPETENCIAS</h2><ul>`;
      const comp = Array.isArray(contenidoReal.competencias) ? contenidoReal.competencias : [contenidoReal.competencias];
      comp.forEach((c: string) => htmlContent += `<li>${c}</li>`);
      htmlContent += `</ul></div>`;
    }
    
    if (contenidoReal.actividades) {
      htmlContent += `<div class="section"><h2>ACTIVIDADES</h2>`;
      
      if (contenidoReal.actividades.inicio) {
        htmlContent += `<h3>Inicio (${contenidoReal.actividades.inicio.duracion || "15 min"})</h3><ul>`;
        const inicio = contenidoReal.actividades.inicio.actividades || contenidoReal.actividades.inicio;
        const actInicio = Array.isArray(inicio) ? inicio : [inicio];
        actInicio.forEach((a: string) => htmlContent += `<li>${a}</li>`);
        htmlContent += `</ul>`;
      }
      
      if (contenidoReal.actividades.desarrollo) {
        htmlContent += `<h3>Desarrollo (${contenidoReal.actividades.desarrollo.duracion || "30-35 min"})</h3><ul>`;
        const desarrollo = contenidoReal.actividades.desarrollo.actividades || contenidoReal.actividades.desarrollo;
        const actDesarrollo = Array.isArray(desarrollo) ? desarrollo : [desarrollo];
        actDesarrollo.forEach((a: string) => htmlContent += `<li>${a}</li>`);
        htmlContent += `</ul>`;
      }
      
      if (contenidoReal.actividades.cierre) {
        htmlContent += `<h3>Cierre (${contenidoReal.actividades.cierre.duracion || "10 min"})</h3><ul>`;
        const cierre = contenidoReal.actividades.cierre.actividades || contenidoReal.actividades.cierre;
        const actCierre = Array.isArray(cierre) ? cierre : [cierre];
        actCierre.forEach((a: string) => htmlContent += `<li>${a}</li>`);
        htmlContent += `</ul>`;
      }
      
      htmlContent += `</div>`;
    }
    
    if (contenidoReal.estrategiasDidacticas || contenidoReal.estrategias) {
      htmlContent += `<div class="section"><h2>ESTRATEGIAS DIDÁCTICAS</h2><ul>`;
      const estrategias = contenidoReal.estrategiasDidacticas || contenidoReal.estrategias;
      const est = Array.isArray(estrategias) ? estrategias : [estrategias];
      est.forEach((e: string) => htmlContent += `<li>${e}</li>`);
      htmlContent += `</ul></div>`;
    }
    
    if (contenidoReal.recursos) {
      htmlContent += `<div class="section"><h2>RECURSOS</h2><ul>`;
      const rec = Array.isArray(contenidoReal.recursos) ? contenidoReal.recursos : [contenidoReal.recursos];
      rec.forEach((r: string) => htmlContent += `<li>${r}</li>`);
      htmlContent += `</ul></div>`;
    }
    
    if (contenidoReal.evaluacion) {
      htmlContent += `<div class="section"><h2>EVALUACIÓN</h2>`;
      if (contenidoReal.evaluacion.criterios) {
        htmlContent += `<h3>Criterios</h3><ul>`;
        contenidoReal.evaluacion.criterios.forEach((c: string) => htmlContent += `<li>${c}</li>`);
        htmlContent += `</ul>`;
      }
      if (contenidoReal.evaluacion.instrumentos) {
        htmlContent += `<h3>Instrumentos</h3><ul>`;
        contenidoReal.evaluacion.instrumentos.forEach((inst: string) => htmlContent += `<li>${inst}</li>`);
        htmlContent += `</ul>`;
      }
      htmlContent += `</div>`;
    }
    
    htmlContent += `</body></html>`;
    
    const filename = id 
      ? `clase_${asignatura}_${grado}_ID${id}.doc`
      : `clase_${asignatura}_${grado}.doc`;
    
    const blob = new Blob([htmlContent], { type: "application/msword" });
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
      const { data } = await api.get(`/clases/${user?.id}`);
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
    <div className="space-y-3">
      {/* Botón de historial - Solo visible cuando NO es vista inicial */}
      {!showHistorialInitially && (
        <div className="flex justify-end mb-2">
          <button 
            onClick={toggleHistorial} 
            className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-sm"
          >
            📂 {showHistorial ? "Cerrar historial" : "Historial de clases"}
          </button>
        </div>
      )}

      {/* Formulario - Solo visible cuando NO hay preview ni historial */}
      {!preview && !showHistorial && (
        <>
          <select
            className="input w-full"
            value={form.asignatura}
            onChange={(e) => setForm({ ...form, asignatura: e.target.value })}
          >
            <option value="Matemáticas">Matemáticas</option>
            <option value="Ciencias Naturales">Ciencias Naturales</option>
            <option value="Lengua Castellana">Lengua Castellana</option>
            <option value="Ciencias Sociales">Ciencias Sociales</option>
            <option value="Inglés">Inglés</option>
            <option value="Educación Física">Educación Física</option>
            <option value="Educación Artística">Educación Artística</option>
            <option value="Tecnología e Informática">Tecnología e Informática</option>
            <option value="Ética y Valores">Ética y Valores</option>
          </select>

          <input
            className="input w-full"
            value={form.grado}
            onChange={(e) => setForm({ ...form, grado: e.target.value })}
            placeholder="Grado (ej: 3°, Quinto)"
          />

          <input
            className="input w-full"
            value={form.tema}
            onChange={(e) => setForm({ ...form, tema: e.target.value })}
            placeholder="Tema de la clase (ej: Suma de fracciones, La célula)"
          />

          <textarea
            className="input w-full"
            value={form.objetivos}
            onChange={(e) => setForm({ ...form, objetivos: e.target.value })}
            placeholder="Objetivos de la clase (opcional)"
            rows={2}
          />

          <button
            className="btn w-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={generateWithAI}
            disabled={loading}
          >
            {loading ? "⏳ Generando..." : "✨ Generar con IA"}
          </button>

          {status && !preview && <p className="text-sm text-center">{status}</p>}
        </>
      )}

      {/* Botones de acción - Solo visible cuando HAY preview */}
      {preview && !showHistorial && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={save}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-green-600 text-white hover:bg-green-700 transition-all shadow-sm"
            >
              💾 Guardar clase
            </button>
            <button
              onClick={() => exportPDF(preview, form.asignatura, form.grado, form.tema)}
              className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
            >
              📄 Descargar PDF
            </button>
            <button
              onClick={() => exportWord(preview, form.asignatura, form.grado, form.tema)}
              className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
            >
              📝 Descargar Word
            </button>
            <button
              onClick={() => setPreview(null)}
              className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm"
            >
              🔄 Nueva clase
            </button>
          </div>

          {status && <p className="text-sm text-center">{status}</p>}
        </div>
      )}

      {/* Panel de Historial */}
      {showHistorial && (
        <div className="w-full bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">📚 Historial de Clases</h3>
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
              <p className="text-lg text-gray-600 mb-2">📭 No hay clases guardadas</p>
              <p className="text-sm text-gray-500">Crea tu primera clase para verla aquí</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {historial.map((clase: any) => (
                <HistorialCard
                  key={clase.id}
                  item={clase}
                  onExportPDF={() => exportPDF(clase, clase.asignatura, clase.grado, clase.tema, clase.id)}
                  onExportWord={() => exportWord(clase, clase.asignatura, clase.grado, clase.tema, clase.id)}
                  onVerClase={() => verClase(clase)}
                  onDelete={() => deleteClase(clase.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vista previa de la clase */}
      {preview && !showHistorial && (
        <div className="mt-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-bold text-lg text-blue-900 mb-2">
              {preview.asignatura || form.asignatura} - {preview.grado || form.grado}
            </h4>
            <p className="text-sm text-blue-700">
              <strong>Tema:</strong> {preview.tema || form.tema}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Duración:</strong> {preview.duracion || "45-60 minutos"}
            </p>
          </div>

          {preview.estandar && (
            <section className="rounded-lg border border-gray-200 p-4 bg-white">
              <p className="font-semibold text-gray-800 mb-2">📋 Estándar (MEN)</p>
              <p className="text-sm text-gray-700">{preview.estandar}</p>
            </section>
          )}

          {preview.dba && (
            <section className="rounded-lg border border-gray-200 p-4 bg-white">
              <p className="font-semibold text-gray-800 mb-2">🎯 DBA</p>
              <p className="text-sm text-gray-700">{preview.dba}</p>
            </section>
          )}

          <section className="rounded-lg border border-gray-200 p-4 bg-white">
            <p className="font-semibold text-gray-800 mb-2">🎯 Objetivos</p>
            <BulletList items={Array.isArray(preview.objetivos) ? preview.objetivos : (form.objetivos ? [form.objetivos] : preview.objetivos)} />
          </section>

          <section className="rounded-lg border border-gray-200 p-4 bg-white">
            <p className="font-semibold text-gray-800 mb-2">💡 Competencias</p>
            <BulletList items={preview.competencias} />
          </section>

          {preview.saberesPrevios && (
            <section className="rounded-lg border border-gray-200 p-4 bg-white">
              <p className="font-semibold text-gray-800 mb-2">📚 Saberes previos</p>
              <BulletList items={preview.saberesPrevios} />
            </section>
          )}

          <section className="rounded-lg border border-gray-200 p-4 bg-white">
            <p className="font-semibold text-gray-800 mb-3">🎭 Actividades</p>
            <div className="grid md:grid-cols-3 gap-3">
              <CardSub title="Inicio" duracion={preview.actividades?.inicio?.duracion}>
                <BulletList items={preview.actividades?.inicio?.actividades || preview.actividades?.inicio} />
              </CardSub>
              <CardSub title="Desarrollo" duracion={preview.actividades?.desarrollo?.duracion}>
                <BulletList items={preview.actividades?.desarrollo?.actividades || preview.actividades?.desarrollo} />
              </CardSub>
              <CardSub title="Cierre" duracion={preview.actividades?.cierre?.duracion}>
                <BulletList items={preview.actividades?.cierre?.actividades || preview.actividades?.cierre} />
              </CardSub>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 p-4 bg-white">
            <p className="font-semibold text-gray-800 mb-2">🔧 Estrategias didácticas</p>
            <BulletList items={preview.estrategias ?? preview.estrategiasDidacticas} />
          </section>

          <section className="rounded-lg border border-gray-200 p-4 bg-white">
            <p className="font-semibold text-gray-800 mb-2">📦 Recursos</p>
            <BulletList items={preview.recursos} />
          </section>

          <section className="rounded-lg border border-gray-200 p-4 bg-white">
            <p className="font-semibold text-gray-800 mb-2">✅ Evaluación</p>
            <div className="space-y-2">
              {preview.evaluacion?.criterios && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Criterios:</p>
                  <BulletList items={preview.evaluacion.criterios} />
                </div>
              )}
              {preview.evaluacion?.instrumentos && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Instrumentos:</p>
                  <BulletList items={preview.evaluacion.instrumentos} />
                </div>
              )}
            </div>
          </section>

          {preview.atencionDiversidad && (
            <section className="rounded-lg border border-gray-200 p-4 bg-white">
              <p className="font-semibold text-gray-800 mb-2">♿ Atención a la diversidad</p>
              <BulletList items={preview.atencionDiversidad} />
            </section>
          )}

          {preview.tareaCasa && (
            <section className="rounded-lg border border-gray-200 p-4 bg-white">
              <p className="font-semibold text-gray-800 mb-2">📝 Tarea para casa</p>
              <p className="text-sm text-gray-700">{preview.tareaCasa.descripcion}</p>
              {preview.tareaCasa.duracion && (
                <p className="text-xs text-gray-600 mt-1">Duración estimada: {preview.tareaCasa.duracion}</p>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}


/* =========================
   Componentes auxiliares
   ========================= */

function BulletList({ items }: { items?: any }) {
  if (!items) {
    return <p className="text-sm text-gray-600">Sin información</p>;
  }

  // Si viene como string único
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

  // Si viene como objeto, mostrar sus valores
  if (!Array.isArray(items) && typeof items === "object") {
    items = Object.values(items);
  }

  // Si es array
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

function CardSub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border p-2">
      <p className="font-medium">{title}</p>
      {children}
    </div>
  );
}
function HistorialCard({
  item,
  onExportPDF,
  onExportWord,
  onVerClase,
  onDelete
}: {
  item: any;
  onExportPDF: () => void;
  onExportWord: () => void;
  onVerClase: () => void;
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
          🆔 ID: {item.id}
        </p>
        {item.tema && (
          <p className="text-xs text-gray-600 mt-1">
            📝 Tema: {item.tema}
          </p>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={onVerClase} 
          className="btn bg-blue-600 text-white text-sm py-2 px-4 hover:bg-blue-700 transition-colors"
        >
          👁️ Ver Clase
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
