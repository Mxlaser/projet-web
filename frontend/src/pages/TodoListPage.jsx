import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceService } from '../api/resourceService';
import { categoryService } from '../api/categoryService';
import { api } from '../api/axios';
import { useTheme } from '../context/ThemeContext';

// Fonction pour obtenir l'URL complète d'un fichier
const getFileUrl = (fileUrl) => {
  if (!fileUrl) return null;
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  // S'assurer que fileUrl commence par / si ce n'est pas déjà une URL complète
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }
  // Ajouter le / au début si nécessaire
  const normalizedUrl = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  return `${baseURL}${normalizedUrl}`;
};

// Fonction pour vérifier si un fichier est une image
const isImageFile = (fileName) => {
  if (!fileName) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};


export default function TodoListPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [deletingIds, setDeletingIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Charger les ressources et catégories au montage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resourcesData, categoriesData] = await Promise.all([
        resourceService.getAllResources(),
        categoryService.getAllCategories(),
      ]);
      setResources(resourcesData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Pour les ressources, on utilise le champ content.completed si disponible, sinon false
  const getCompleted = (resource) => {
    return resource.content?.completed || false;
  };

  const toggleTodo = async (id) => {
    const resource = resources.find(r => r.id === id);
    if (!resource) return;

    const newCompleted = !getCompleted(resource);
    const updatedContent = {
      ...resource.content,
      completed: newCompleted,
    };

    try {
      await resourceService.updateResource(id, {
        title: resource.title,
        type: resource.type,
        content: updatedContent,
        categoryId: resource.categoryId,
        tags: resource.tags?.map(t => t.name) || [],
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const toggleFavorite = async (id) => {
    const resource = resources.find(r => r.id === id);
    if (!resource) return;

    const newFavorite = !(resource.content?.favorite || false);
    const updatedContent = {
      ...resource.content,
      favorite: newFavorite,
    };

    try {
      await resourceService.updateResource(id, {
        title: resource.title,
        type: resource.type,
        content: updatedContent,
        categoryId: resource.categoryId,
        tags: resource.tags?.map(t => t.name) || [],
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleEdit = (id) => {
    navigate(`/resources/${id}/edit`);
  };

  const handleViewResource = (resource) => {
    setSelectedResource(resource);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedResource(null);
  };

  const handleDeleteFromModal = async () => {
    if (!selectedResource) return;
    await handleDelete(selectedResource.id);
    handleCloseViewModal();
  };


  const handleDelete = async (id) => {
    if (deletingIds.includes(id)) return;
    setDeletingIds((prev) => [...prev, id]);
    
    try {
      await resourceService.deleteResource(id);
      setTimeout(() => {
        setResources((prev) => prev.filter((resource) => resource.id !== id));
        setDeletingIds((prev) => prev.filter((resourceId) => resourceId !== id));
      }, 200);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
      setDeletingIds((prev) => prev.filter((resourceId) => resourceId !== id));
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      await categoryService.createCategory(newCategoryName.trim());
      await loadData();
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création de la catégorie');
    }
  };

  const handleCancelCategory = () => {
    setNewCategoryName('');
    setIsCategoryModalOpen(false);
  };

  // Récupérer tous les tags uniques
  const allTags = useMemo(() => {
    const tagSet = new Set();
    resources.forEach(resource => {
      resource.tags?.forEach(tag => tagSet.add(tag.name));
    });
    return Array.from(tagSet).sort();
  }, [resources]);

  const filteredResources = resources.filter(resource => {
    // Filtre par statut (all/active/completed)
    const completed = getCompleted(resource);
    let matchesStatus = true;
    if (filter === 'completed') matchesStatus = completed;
    if (filter === 'active') matchesStatus = !completed;

    // Filtre par catégorie
    let matchesCategory = true;
    if (selectedCategoryId !== null) {
      matchesCategory = resource.categoryId === selectedCategoryId;
    }

    // Filtre par tag
    let matchesTag = true;
    if (selectedTag !== null) {
      matchesTag = resource.tags?.some(tag => tag.name === selectedTag) || false;
    }

    // Filtre par recherche textuelle
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const titleMatch = resource.title.toLowerCase().includes(query);
      const descriptionMatch = resource.content?.description?.toLowerCase().includes(query) || false;
      const urlMatch = resource.content?.url?.toLowerCase().includes(query) || false;
      const fileNameMatch = resource.content?.originalName?.toLowerCase().includes(query) || false;
      const categoryMatch = resource.category?.name?.toLowerCase().includes(query) || false;
      const tagsMatch = resource.tags?.some(tag => tag.name.toLowerCase().includes(query)) || false;
      matchesSearch = titleMatch || descriptionMatch || urlMatch || fileNameMatch || categoryMatch || tagsMatch;
    }

    return matchesStatus && matchesCategory && matchesTag && matchesSearch;
  });

  return (
    <div 
      className="min-h-screen bg-[#f7f7f7] dark:bg-[#1a1a1a] flex flex-col items-center py-10 px-4"
      onClick={() => {
        if (isDropdownOpen) setIsDropdownOpen(false);
        if (isCategoryFilterOpen) setIsCategoryFilterOpen(false);
        if (isTagFilterOpen) setIsTagFilterOpen(false);
        if (isFabMenuOpen) setIsFabMenuOpen(false);
      }}
    >
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <h1 className="text-[26px] font-medium text-[#252525] dark:text-[#f7f7f7] uppercase">
            Vos ressources
          </h1>

          {/* Search and Filter Bar */}
          <div className="flex gap-4 items-start w-full">
            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[38px] rounded-[5px] border border-[#6c63ff] dark:border-[#5a52e0] px-4 pr-10 text-sm text-[#252525] dark:text-[#f7f7f7] dark:bg-[#2a2a2a] placeholder:text-[#c3c1e5] dark:placeholder:text-[#666] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/60"
              />
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#252525] dark:text-[#f7f7f7] pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Add Button */}
            <button
              onClick={() => navigate('/resources/new')}
              className="w-[38px] h-[38px] bg-[#6c63ff] rounded-[5px] flex items-center justify-center hover:bg-[#5a52e0] transition-colors"
            >
              <svg
                className="w-5 h-5 text-[#f7f7f7]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>

            {/* Filter Dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-[#6c63ff] text-[#f7f7f7] text-lg font-medium uppercase px-4 py-2 rounded-[5px] h-[38px] flex items-center gap-2 hover:bg-[#5a52e0] transition-colors"
              >
                {filter === 'all' ? 'all' : filter === 'active' ? 'active' : 'completed'}
                <svg
                  className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full mt-1 right-0 bg-white dark:bg-[#2a2a2a] border border-[#e5e7eb] dark:border-[#404040] rounded-[5px] shadow-md min-w-[120px] z-10 overflow-hidden">
                  <button
                    onClick={() => {
                      setFilter('all');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      filter === 'all'
                        ? 'bg-[rgba(108,99,255,0.1)] text-[#6c63ff]'
                        : 'text-[#374151] dark:text-[#e5e5e5] hover:bg-gray-50 dark:hover:bg-[#333333]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>All</span>
                      {filter === 'all' && (
                        <svg
                          className="w-4 h-4 text-[#6c63ff]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setFilter('active');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      filter === 'active'
                        ? 'bg-[rgba(108,99,255,0.1)] text-[#6c63ff]'
                        : 'text-[#374151] dark:text-[#e5e5e5] hover:bg-gray-50 dark:hover:bg-[#333333]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Active</span>
                      {filter === 'active' && (
                        <svg
                          className="w-4 h-4 text-[#6c63ff]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setFilter('completed');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      filter === 'completed'
                        ? 'bg-[rgba(108,99,255,0.1)] text-[#6c63ff]'
                        : 'text-[#374151] dark:text-[#e5e5e5] hover:bg-gray-50 dark:hover:bg-[#333333]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Completed</span>
                      {filter === 'completed' && (
                        <svg
                          className="w-4 h-4 text-[#6c63ff]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="w-[38px] h-[38px] bg-[#6c63ff] dark:bg-[#5a52e0] rounded-[5px] flex items-center justify-center hover:bg-[#5a52e0] dark:hover:bg-[#6c63ff] transition-colors"
              title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
            >
              {isDarkMode ? (
                <svg
                  className="w-5 h-5 text-[#f7f7f7]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-[#f7f7f7]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Filtres Catégorie et Tag */}
          <div className="flex gap-3 items-center w-full flex-wrap">
            {/* Filtre Catégorie */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => {
                  setIsCategoryFilterOpen(!isCategoryFilterOpen);
                  setIsTagFilterOpen(false);
                }}
                className={`px-4 py-2 rounded-[5px] text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedCategoryId !== null
                    ? 'bg-[#6c63ff] text-[#f7f7f7]'
                    : 'bg-white dark:bg-[#2a2a2a] border border-[#e5e7eb] dark:border-[#404040] text-[#374151] dark:text-[#e5e5e5] hover:bg-gray-50 dark:hover:bg-[#333333]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {selectedCategoryId !== null
                  ? categories.find(c => c.id === selectedCategoryId)?.name || 'Catégorie'
                  : 'Toutes les catégories'}
                <svg
                  className={`w-3 h-3 transition-transform ${isCategoryFilterOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isCategoryFilterOpen && (
                <div className="absolute top-full mt-1 left-0 bg-white dark:bg-[#2a2a2a] border border-[#e5e7eb] dark:border-[#404040] rounded-[5px] shadow-md min-w-[200px] max-h-[300px] overflow-y-auto z-20">
                  <button
                    onClick={() => {
                      setSelectedCategoryId(null);
                      setIsCategoryFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      selectedCategoryId === null
                        ? 'bg-[rgba(108,99,255,0.1)] text-[#6c63ff]'
                        : 'text-[#374151] dark:text-[#e5e5e5] hover:bg-gray-50 dark:hover:bg-[#333333]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Toutes les catégories</span>
                      {selectedCategoryId === null && (
                        <svg className="w-4 h-4 text-[#6c63ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategoryId(category.id);
                        setIsCategoryFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        selectedCategoryId === category.id
                          ? 'bg-[rgba(108,99,255,0.1)] text-[#6c63ff]'
                          : 'text-[#374151] dark:text-[#e5e5e5] hover:bg-gray-50 dark:hover:bg-[#333333]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.name}</span>
                        {selectedCategoryId === category.id && (
                          <svg className="w-4 h-4 text-[#6c63ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filtre Tag */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => {
                  setIsTagFilterOpen(!isTagFilterOpen);
                  setIsCategoryFilterOpen(false);
                }}
                className={`px-4 py-2 rounded-[5px] text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedTag !== null
                    ? 'bg-[#6c63ff] text-[#f7f7f7]'
                    : 'bg-white dark:bg-[#2a2a2a] border border-[#e5e7eb] dark:border-[#404040] text-[#374151] dark:text-[#e5e5e5] hover:bg-gray-50 dark:hover:bg-[#333333]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {selectedTag !== null ? selectedTag : 'Tous les tags'}
                <svg
                  className={`w-3 h-3 transition-transform ${isTagFilterOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isTagFilterOpen && (
                <div className="absolute top-full mt-1 left-0 bg-white dark:bg-[#2a2a2a] border border-[#e5e7eb] dark:border-[#404040] rounded-[5px] shadow-md min-w-[200px] max-h-[300px] overflow-y-auto z-20">
                  <button
                    onClick={() => {
                      setSelectedTag(null);
                      setIsTagFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      selectedTag === null
                        ? 'bg-[rgba(108,99,255,0.1)] text-[#6c63ff]'
                        : 'text-[#374151] dark:text-[#e5e5e5] hover:bg-gray-50 dark:hover:bg-[#333333]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Tous les tags</span>
                      {selectedTag === null && (
                        <svg className="w-4 h-4 text-[#6c63ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTag(tag);
                        setIsTagFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        selectedTag === tag
                          ? 'bg-[rgba(108,99,255,0.1)] text-[#6c63ff]'
                          : 'text-[#374151] dark:text-[#e5e5e5] hover:bg-gray-50 dark:hover:bg-[#333333]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>#{tag}</span>
                        {selectedTag === tag && (
                          <svg className="w-4 h-4 text-[#6c63ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Boutons pour réinitialiser les filtres */}
            {(selectedCategoryId !== null || selectedTag !== null) && (
              <button
                onClick={() => {
                  setSelectedCategoryId(null);
                  setSelectedTag(null);
                }}
                className="px-3 py-2 rounded-[5px] text-sm text-[#666] dark:text-[#999] hover:text-[#252525] dark:hover:text-[#f7f7f7] hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Vos ressources */}
        <div className="relative w-full">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
              {error}
              <button
                onClick={() => setError('')}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}
          {loading ? (
            <div className="text-center py-8 text-[#666] dark:text-[#999]">Chargement...</div>
          ) : (
            <div className="space-y-0">
              {filteredResources.length === 0 ? (
                <div className="text-center py-8 text-[#666] dark:text-[#999]">Aucune ressource trouvée</div>
              ) : (
                filteredResources.map((resource, index) => {
                  const completed = getCompleted(resource);
                  const favorite = resource.content?.favorite || false;
                  return (
                    <div
                      key={resource.id}
                      className={`group relative transition-all duration-200 ease-out ${
                        deletingIds.includes(resource.id)
                          ? 'opacity-0 -translate-x-4 scale-[0.98]'
                          : 'opacity-100 translate-x-0 scale-100'
                      }`}
                    >
                      {/* Separator Line */}
                      {index > 0 && (
                        <div className="absolute top-0 left-0 right-0 h-px bg-[#e0e0e0] dark:bg-[#404040]"></div>
                      )}

                      <div 
                        className="flex items-center gap-4 py-4 px-2 hover:bg-white/50 dark:hover:bg-[#2a2a2a]/50 transition-colors cursor-pointer"
                        onClick={() => handleViewResource(resource)}
                      >
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleTodo(resource.id)}
                          className={`w-[26px] h-[26px] rounded-[2px] border-2 border-[#6c63ff] flex items-center justify-center flex-shrink-0 ${
                            completed ? 'bg-[#6c63ff]' : 'bg-transparent'
                          }`}
                        >
                          {completed && (
                            <svg
                              className="w-4 h-4 text-[#f7f7f7]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>

                        {/* Resource Text with Heart and Description */}
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`text-xl uppercase font-medium dark:text-[#f7f7f7] ${
                                completed
                                  ? 'line-through text-[rgba(37,37,37,0.5)]'
                                  : 'text-[#252525]'
                              }`}
                            >
                              {resource.title}
                            </p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Category Badge */}
                              {resource.category && (
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#6c63ff] text-white">
                                  {resource.category.name}
                                </span>
                              )}
                              {/* Favorite Heart */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(resource.id);
                                }}
                                className="flex items-center justify-center w-5 h-5 flex-shrink-0 hover:scale-110 transition-transform"
                              >
                                <svg
                                  className={`w-5 h-5 transition-colors ${
                                    favorite ? 'text-red-500 fill-red-500' : 'text-[#c3c1e5]'
                                  }`}
                                  fill={favorite ? 'currentColor' : 'none'}
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                          {/* Description, Lien et Fichier */}
                          {resource.type === 'link' ? (
                            <div className="flex flex-col gap-1">
                              {resource.content?.description && (
                                <p
                                  className={`text-sm text-[#666] truncate ${
                                    completed ? 'line-through text-[rgba(102,102,102,0.5)]' : ''
                                  }`}
                                  title={resource.content.description}
                                >
                                  {resource.content.description}
                                </p>
                              )}
                              {resource.content?.url && (() => {
                                const url = resource.content.url;
                                // S'assurer que l'URL est valide et externe
                                const formattedUrl = url && !url.startsWith('http://') && !url.startsWith('https://') 
                                  ? `https://${url}` 
                                  : url;
                                return (
                                  <a
                                    href={formattedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-sm text-[#6c63ff] truncate hover:underline ${
                                      completed ? 'line-through text-[rgba(108,99,255,0.5)]' : ''
                                    }`}
                                    title={formattedUrl}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {formattedUrl}
                                  </a>
                                );
                              })()}
                            </div>
                          ) : resource.type === 'file' && resource.content?.fileUrl ? (
                            <div className="flex flex-col gap-2">
                              {resource.content?.description && (
                                <p
                                  className={`text-sm text-[#666] truncate ${
                                    completed ? 'line-through text-[rgba(102,102,102,0.5)]' : ''
                                  }`}
                                  title={resource.content.description}
                                >
                                  {resource.content.description}
                                </p>
                              )}
                              {(() => {
                                const fileUrl = getFileUrl(resource.content.fileUrl);
                                const fileName = resource.content.originalName || resource.content.fileUrl?.split('/').pop() || 'Fichier';
                                // Vérifier si c'est une image en utilisant le nom de fichier ou l'extension dans l'URL
                                const fileUrlForCheck = resource.content.fileUrl || '';
                                const isImage = isImageFile(fileName) || isImageFile(fileUrlForCheck);
                                
                                // Debug: afficher l'URL dans la console
                                console.log('File URL Debug:', {
                                  original: resource.content.fileUrl,
                                  generated: fileUrl,
                                  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
                                  fileName: fileName,
                                  isImage: isImage
                                });
                                
                                return (
                                  <div className="flex items-center gap-2">
                                    {isImage && fileUrl ? (
                                      <img
                                        src={fileUrl}
                                        alt={fileName}
                                        className="w-16 h-16 object-cover rounded border border-[#e5e7eb]"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(fileUrl, '_blank');
                                        }}
                                        onError={(e) => {
                                          console.error('Erreur de chargement de l\'image:', fileUrl);
                                          // Si l'image ne charge pas, remplacer par un lien
                                          const parent = e.target.parentElement;
                                          e.target.style.display = 'none';
                                          if (!parent.querySelector('.file-fallback-link')) {
                                            const link = document.createElement('a');
                                            link.href = fileUrl;
                                            link.target = '_blank';
                                            link.rel = 'noopener noreferrer';
                                            link.className = 'file-fallback-link text-sm text-[#6c63ff] hover:underline flex items-center gap-1';
                                            link.innerHTML = `
                                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                              </svg>
                                              ${fileName}
                                            `;
                                            parent.appendChild(link);
                                          }
                                        }}
                                        style={{ cursor: 'pointer' }}
                                      />
                                    ) : (
                                      <a
                                        href={fileUrl || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-[#6c63ff] hover:underline flex items-center gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        {fileName}
                                      </a>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          ) : (
                            resource.content?.description && (
                              <p
                                className={`text-sm text-[#666] truncate ${
                                  completed ? 'line-through text-[rgba(102,102,102,0.5)]' : ''
                                }`}
                                title={resource.content.description}
                              >
                                {resource.content.description}
                              </p>
                            )
                          )}
                        </div>

                        {/* Action Icons (visible on hover) */}
                        <div className="flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Edit Icon */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(resource.id);
                            }}
                            className="w-[18px] h-[18px] text-[#252525] dark:text-[#e5e5e5] hover:text-[#6c63ff] transition-colors"
                          >
                            <svg
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          {/* Delete Icon */}
                          <button
                            onClick={() => handleDelete(resource.id)}
                            className="w-[18px] h-[18px] text-[#252525] hover:text-red-500 transition-colors"
                          >
                            <svg
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Floating Add Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsFabMenuOpen(!isFabMenuOpen);
          }}
          className="fixed bottom-8 right-8 w-[50px] h-[50px] bg-[#6c63ff] rounded-full flex items-center justify-center shadow-lg hover:bg-[#5a52e0] transition-transform transition-colors hover:scale-110 z-30"
        >
          <svg
            className="w-6 h-6 text-[#f7f7f7]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>

        {/* Floating Add Menu */}
        {isFabMenuOpen && (
          <div
            className="fixed bottom-24 right-8 flex flex-col gap-2 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setIsFabMenuOpen(false);
                navigate('/resources/new');
              }}
              className="px-4 py-2 rounded-[8px] bg-white dark:bg-[#2a2a2a] shadow-lg border border-[#e5e7eb] dark:border-[#404040] text-sm text-[#252525] dark:text-[#e5e5e5] hover:bg-[#f3f4ff] dark:hover:bg-[#333333] transition transform origin-bottom-right translate-y-1 opacity-100"
            >
              Ajouter une ressource
            </button>
            <button
              onClick={() => {
                setIsFabMenuOpen(false);
                setIsCategoryModalOpen(true);
              }}
              className="px-4 py-2 rounded-[8px] bg-white dark:bg-[#2a2a2a] shadow-lg border border-[#e5e7eb] dark:border-[#404040] text-sm text-[#252525] dark:text-[#e5e5e5] hover:bg-[#f3f4ff] dark:hover:bg-[#333333] transition transform origin-bottom-right translate-y-1 opacity-100"
            >
              Créer une catégorie
            </button>
          </div>
        )}
      </div>

      {/* Modal for Viewing Resource */}
      {isViewModalOpen && selectedResource && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleCloseViewModal}
        >
          <div 
            className="bg-white dark:bg-[#2a2a2a] rounded-[16px] p-6 w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#252525] dark:text-[#f7f7f7]">
                {selectedResource.title}
              </h2>
              <button
                onClick={handleCloseViewModal}
                className="w-6 h-6 flex items-center justify-center text-[#252525] dark:text-[#e5e5e5] hover:text-[#6c63ff] transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 mb-6">
              {/* Type */}
              <div>
                <span className="text-xs font-medium text-[#666] uppercase">Type</span>
                <p className="text-sm text-[#252525] dark:text-[#e5e5e5] capitalize">{selectedResource.type}</p>
              </div>

              {/* Category */}
              {selectedResource.category && (
                <div>
                  <span className="text-xs font-medium text-[#666] dark:text-[#999] uppercase">Catégorie</span>
                  <p className="text-sm text-[#252525] dark:text-[#e5e5e5]">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#6c63ff] text-white mt-1">
                      {selectedResource.category.name}
                    </span>
                  </p>
                </div>
              )}

              {/* Tags */}
              {selectedResource.tags && selectedResource.tags.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-[#666] dark:text-[#999] uppercase">Tags</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedResource.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-block px-2 py-1 rounded text-xs bg-gray-100 dark:bg-[#333333] text-[#252525] dark:text-[#e5e5e5]"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedResource.content?.description && (
                <div>
                  <span className="text-xs font-medium text-[#666] dark:text-[#999] uppercase">Description</span>
                  <p className="text-sm text-[#252525] dark:text-[#e5e5e5] mt-1 whitespace-pre-wrap">
                    {selectedResource.content.description}
                  </p>
                </div>
              )}

              {/* URL for links */}
              {selectedResource.type === 'link' && selectedResource.content?.url && (
                <div>
                  <span className="text-xs font-medium text-[#666] dark:text-[#999] uppercase">Lien</span>
                  <a
                    href={selectedResource.content.url.startsWith('http') 
                      ? selectedResource.content.url 
                      : `https://${selectedResource.content.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#6c63ff] hover:underline block mt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {selectedResource.content.url}
                  </a>
                </div>
              )}

              {/* File for file type */}
              {selectedResource.type === 'file' && selectedResource.content?.fileUrl && (() => {
                const fileUrl = getFileUrl(selectedResource.content.fileUrl);
                const fileName = selectedResource.content.originalName || selectedResource.content.fileUrl?.split('/').pop() || 'Fichier';
                const isImage = isImageFile(fileName);
                
                return (
                  <div>
                    <span className="text-xs font-medium text-[#666] dark:text-[#999] uppercase">Fichier</span>
                    <div className="mt-2">
                      {isImage ? (
                        <div className="space-y-2">
                          <img
                            src={fileUrl || '#'}
                            alt={fileName}
                            className="max-w-full max-h-64 object-contain rounded border border-[#e5e7eb]"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(fileUrl, '_blank');
                            }}
                            onError={(e) => {
                              console.error('Erreur de chargement de l\'image dans la modal:', fileUrl);
                              // Si l'image ne charge pas, masquer l'image
                              e.target.style.display = 'none';
                            }}
                            style={{ cursor: 'pointer' }}
                          />
                          <a
                            href={fileUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#6c63ff] hover:underline flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Télécharger {fileName}
                          </a>
                        </div>
                      ) : (
                        <a
                          href={fileUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#6c63ff] hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {fileName}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Status */}
              <div>
                <span className="text-xs font-medium text-[#666] uppercase">Statut</span>
                <div className="flex items-center gap-4 mt-1">
                  <span className={`text-sm ${getCompleted(selectedResource) ? 'text-[rgba(37,37,37,0.5)] dark:text-[rgba(247,247,247,0.5)] line-through' : 'text-[#252525] dark:text-[#e5e5e5]'}`}>
                    {getCompleted(selectedResource) ? 'Terminé' : 'En cours'}
                  </span>
                  {selectedResource.content?.favorite && (
                    <span className="text-sm text-red-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Favori
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-4 border-t border-[#e5e7eb] dark:border-[#404040]">
              <button
                onClick={handleDeleteFromModal}
                className="px-6 py-2 rounded-[5px] border border-red-200 dark:border-red-800 bg-white dark:bg-[#2a2a2a] text-red-600 dark:text-red-400 text-sm font-medium uppercase hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Supprimer
              </button>
              <button
                onClick={() => {
                  handleCloseViewModal();
                  handleEdit(selectedResource.id);
                }}
                className="px-6 py-2 rounded-[5px] bg-[#6c63ff] text-[#f7f7f7] text-sm font-medium uppercase hover:bg-[#5a52e0] transition-colors"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Creating New Category */}
      {isCategoryModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleCancelCategory}
        >
          <div 
            className="bg-white dark:bg-[#2a2a2a] rounded-[16px] p-6 w-full max-w-md mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#252525] dark:text-[#f7f7f7]">
                Créer une nouvelle catégorie
              </h2>
              <button
                onClick={handleCancelCategory}
                className="w-6 h-6 flex items-center justify-center text-[#252525] dark:text-[#e5e5e5] hover:text-[#6c63ff] transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Input Field */}
            <div className="mb-6 space-y-4">
              <input
                type="text"
                placeholder="Nom de la catégorie"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateCategory();
                  }
                }}
                className="w-full h-12 rounded-[5px] border border-[#c3c1e5] dark:border-[#5a52e0] px-4 text-sm text-[#252525] dark:text-[#f7f7f7] dark:bg-[#333333] placeholder:text-[#c3c1e5] dark:placeholder:text-[#666] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/60"
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                onClick={handleCancelCategory}
                className="px-6 py-2 rounded-[5px] border border-[#e5e7eb] dark:border-[#404040] bg-white dark:bg-[#2a2a2a] text-[#374151] dark:text-[#e5e5e5] text-sm font-medium uppercase hover:bg-gray-50 dark:hover:bg-[#333333] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateCategory}
                className="px-6 py-2 rounded-[5px] bg-[#6c63ff] text-[#f7f7f7] text-sm font-medium uppercase hover:bg-[#5a52e0] transition-colors"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
