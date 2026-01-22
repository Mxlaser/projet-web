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

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const availableTags = ["Travail", "React", "Design", "Backend", "Personnel"];

  async function loadResources({
    searchValue = debouncedSearch,
    tagValue = selectedTag,
  } = {}) {
    setError("");
    setIsLoading(true);
    try {
      const params = {};
      if (searchValue) params.search = searchValue;
      if (tagValue) params.tag = tagValue;

      const data = await fetchResources(params);
      setResources(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Impossible de charger les ressources (API down ou token invalide).");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadResources();
  }, [debouncedSearch, selectedTag]);

  async function handleDelete(id) {
    const ok = window.confirm("Supprimer cette ressource ?");
    if (!ok) return;

    try {
      await deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert("Suppression impossible (token invalide ? API down ?).");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Dashboard</h1>

      <div className="flex gap-6">
        <aside className="w-48 shrink-0">
          <div className="text-sm font-semibold mb-2">Tags</div>
          <ul className="space-y-2">
            <li>
              <button
                className={`text-sm ${
                  selectedTag === "" ? "font-semibold underline" : "opacity-70"
                }`}
                onClick={() => setSelectedTag("")}
              >
                Tous
              </button>
            </li>
            {availableTags.map((tag) => (
              <li key={tag}>
                <button
                  className={`text-sm ${
                    selectedTag === tag
                      ? "font-semibold underline"
                      : "opacity-70"
                  }`}
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex-1 min-w-0">
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
              onClick={() => {
                const trimmed = search.trim();
                setDebouncedSearch(trimmed);
                loadResources({ searchValue: trimmed });
              }}
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
      </div>
    </div>
  );
}
