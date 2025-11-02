import { useState } from "react";
import { useAuthStore } from "./store/auth";
import Header from "./components/Header";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import "./styles.css";

export default function App() {
  const { token } = useAuthStore();
  const [page, setPage] = useState("mallas");
  const [page, setPage] = useState("planeadores");
  const [page, setPage] = useState("clases");

  return (
    <div className="app">
      <Header onNavigate={setPage} currentPage={page} />

      <main className="main" style={{ paddingTop: 10, minHeight: "calc(80vh - 104px)" }}>
        {!token ? <Login /> : <Dashboard page={page} />}
      </main>
    </div>
  );
}