import { useEffect, useState } from "react";
import { fetchResources, deleteResource } from "../services/resourcesService";

function Spinner() {
  return (
    <div className="py-6 text-sm opacity-70">
      Chargement...
    </div>
  );
}

export default function DashboardPage() {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // (optionnel) paramètres de filtre
  const [search, setSearch] = useState("");

  async function loadResources() {
    setError("");
    setIsLoading(true);
    try {
      const data = await fetchResources(
        search ? { search } : {}
      );
      setResources(Array.isArray(data) ? data : []);
    } catch (e) {
      // si 401 -> token absent/expiré (ProtectedRoute devrait empêcher ça, mais on gère quand même)
      setError("Impossible de charger les ressources (API down ou token invalide).");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id) {
    // UX simple : confirmation
    const ok = window.confirm("Supprimer cette ressource ?");
    if (!ok) return;

    try {
      await deleteResource(id);
      // ✅ Mise à jour locale sans reload
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert("Suppression impossible (token invalide ? API down ?).");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Dashboard</h1>

      {/* mini barre de recherche (facultatif mais pratique pour tester les query params) */}
      <div className="flex gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 w-80"
          placeholder="search (ex: React)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="border rounded px-3 py-2"
          onClick={loadResources}
        >
          Rechercher
        </button>
      </div>

      {isLoading && <Spinner />}

      {error && (
        <div className="text-sm text-red-600 mb-4">{error}</div>
      )}

      {!isLoading && !error && resources.length === 0 && (
        <div className="text-sm opacity-70">Aucune ressource.</div>
      )}

      {!isLoading && resources.length > 0 && (
        <ul className="space-y-2">
          {resources.map((r) => (
            <li
              key={r.id}
              className="border rounded p-3 flex items-center justify-between"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">
                  {r.title}{" "}
                  <span className="text-xs opacity-60">({r.type})</span>
                </div>

                <div className="text-xs opacity-70 mt-1">
                  Catégorie : {r.category?.name ?? "—"}
                </div>

                <div className="text-xs opacity-70 mt-1">
                  Tags :{" "}
                  {(r.tags ?? []).map((t) => t.name).join(", ") || "—"}
                </div>
              </div>

              <button
                className="text-sm text-red-600 hover:underline"
                onClick={() => handleDelete(r.id)}
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
