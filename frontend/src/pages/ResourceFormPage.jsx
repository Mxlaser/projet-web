import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { resourceService } from '../api/resourceService';
import { categoryService } from '../api/categoryService';
import { api } from '../api/axios';

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

export default function ResourceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('note');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentResource, setCurrentResource] = useState(null);

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadResource();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      setError('Erreur lors du chargement des catégories');
    }
  };

  const loadResource = async () => {
    try {
      setLoading(true);
      const resource = await resourceService.getResourceById(id);
      setCurrentResource(resource);
      setTitle(resource.title);
      setDescription(resource.content?.description || '');
      setUrl(resource.content?.url || '');
      setType(resource.type);
      setCategoryId(resource.categoryId || '');
      setTags(resource.tags?.map(t => t.name).join(', ') || '');
    } catch (err) {
      setError('Erreur lors du chargement de la ressource');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tagsArray = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const contentData = {
        description,
      };
      
      // Si c'est un lien, ajouter l'URL au contenu
      if (type === 'link' && url) {
        contentData.url = url;
      }

      // S'assurer que le type est "file" si un fichier est uploadé
      const finalType = file ? 'file' : type;

      const resourceData = {
        title,
        type: finalType,
        content: contentData,
        categoryId: categoryId ? Number(categoryId) : null,
        tags: tagsArray,
        file,
      };

      if (isEdit) {
        await resourceService.updateResource(id, {
          title,
          type: finalType,
          content: contentData,
          categoryId: categoryId ? Number(categoryId) : null,
          tags: tagsArray,
          file, // Inclure le fichier si présent
        });
      } else {
        await resourceService.createResource(resourceData);
      }

      navigate('/todos');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="text-[#666]">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-semibold text-[#252525] mb-6">
          {isEdit ? 'Modifier la ressource' : 'Créer une nouvelle ressource'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-md">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#252525] mb-2">
                Titre *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full h-10 rounded-md border border-[#c3c1e5] px-4 text-sm text-[#252525] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#252525] mb-2">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-10 rounded-md border border-[#c3c1e5] px-4 text-sm text-[#252525] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/60 bg-white"
              >
                <option value="note">Note</option>
                <option value="link">Lien</option>
                <option value="file">Fichier</option>
              </select>
            </div>

            {type === 'link' && (
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required={type === 'link'}
                  className="w-full h-10 rounded-md border border-[#c3c1e5] px-4 text-sm text-[#252525] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/60"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#252525] mb-2">
                Description{type === 'link' ? ' (optionnel)' : ''}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder={type === 'link' ? 'Description du lien (optionnel)' : ''}
                className="w-full rounded-md border border-[#c3c1e5] px-4 py-3 text-sm text-[#252525] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/60 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#252525] mb-2">
                Catégorie
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 rounded-md border border-[#c3c1e5] px-4 text-sm text-[#252525] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/60 bg-white"
              >
                <option value="">Aucune catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#252525] mb-2">
                Tags (séparés par des virgules)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
                className="w-full h-10 rounded-md border border-[#c3c1e5] px-4 text-sm text-[#252525] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/60"
              />
            </div>

            {type === 'file' && (
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-2">
                  Fichier {!isEdit && '*'}
                </label>
                {isEdit && currentResource?.content?.fileUrl && (() => {
                  const fileUrl = getFileUrl(currentResource.content.fileUrl);
                  const fileName = currentResource.content.originalName || 'Fichier';
                  const isImage = isImageFile(fileName);
                  
                  return (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md border border-[#e5e7eb]">
                      <p className="text-xs font-medium text-[#666] mb-2">Fichier actuel :</p>
                      {isImage ? (
                        <div className="space-y-2">
                          <img
                            src={fileUrl || '#'}
                            alt={fileName}
                            className="max-w-full max-h-48 object-contain rounded border border-[#e5e7eb]"
                            onClick={() => window.open(fileUrl, '_blank')}
                            style={{ cursor: 'pointer' }}
                          />
                          <a
                            href={fileUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#6c63ff] hover:underline flex items-center gap-1"
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
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  required={type === 'file' && !isEdit}
                  className="w-full h-10 rounded-md border border-[#c3c1e5] px-4 text-sm text-[#252525] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/60"
                />
                {isEdit && (
                  <p className="mt-1 text-xs text-[#666]">
                    Laissez vide pour conserver le fichier actuel
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-end mt-6">
            <button
              type="button"
              onClick={() => navigate('/todos')}
              className="px-6 py-2 rounded-md border border-[#e5e7eb] bg-white text-[#374151] text-sm font-medium uppercase hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-md bg-[#6c63ff] text-[#f7f7f7] text-sm font-medium uppercase hover:bg-[#5a52e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
