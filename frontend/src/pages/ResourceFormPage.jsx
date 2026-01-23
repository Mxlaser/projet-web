import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { resourceService } from '../api/resourceService';
import { categoryService } from '../api/categoryService';
import { api } from '../api/axios';

const getFileUrl = (fileUrl) => {
  if (!fileUrl) return null;
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }
  const normalizedUrl = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  return `${baseURL}${normalizedUrl}`;
};

const isImageFile = (fileName) => {
  if (!fileName) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

export default function ResourceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const customDate = searchParams.get('date');

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
      if (type === 'link' && url) {
        contentData.url = url;
      }

      const finalType = file ? 'file' : type;

      const resourceData = {
        title,
        type: finalType,
        content: contentData,
        categoryId: categoryId ? Number(categoryId) : null,
        tags: tagsArray,
        file,
      };

      // Ajouter la date personnalisée si fournie (pour création depuis le calendrier)
      if (!isEdit && customDate) {
        resourceData.createdAt = customDate;
      }

      if (isEdit) {
        await resourceService.updateResource(id, {
          title,
          type: finalType,
          content: contentData,
          categoryId: categoryId ? Number(categoryId) : null,
          tags: tagsArray,
          file, 
        });
      } else {
        await resourceService.createResource(resourceData);
      }

      // Rediriger vers le calendrier si on vient du calendrier, sinon vers la liste
      navigate(customDate ? '/calendar' : '/resources');
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
                
                {/* Input de fichier stylisé */}
                <div className="relative">
                  <input
                    type="file"
                    id="file-input"
                    onChange={(e) => setFile(e.target.files[0])}
                    required={type === 'file' && !isEdit}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-input"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#c3c1e5] rounded-lg cursor-pointer bg-white hover:bg-gray-50 hover:border-[#6c63ff] transition-colors duration-200"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-10 h-10 mb-3 text-[#6c63ff]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-[#666]">
                        <span className="font-semibold text-[#6c63ff]">Cliquez pour téléverser</span> ou glissez-déposez
                      </p>
                      <p className="text-xs text-[#999]">
                        PNG, JPG, GIF, PDF (MAX. 5MB)
                      </p>
                    </div>
                  </label>
                  
                  {/* Afficher le nom du fichier sélectionné */}
                  {file && (
                    <div className="mt-3 p-3 bg-[#6c63ff]/10 border border-[#6c63ff]/20 rounded-md flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <svg
                          className="w-5 h-5 text-[#6c63ff] flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-sm text-[#252525] truncate" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-xs text-[#666] flex-shrink-0">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          const input = document.getElementById('file-input');
                          if (input) input.value = '';
                        }}
                        className="ml-2 text-[#666] hover:text-red-500 transition-colors"
                        title="Supprimer le fichier"
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
                  )}
                </div>
                
                {isEdit && (
                  <p className="mt-2 text-xs text-[#666]">
                    Laissez vide pour conserver le fichier actuel
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-end mt-6">
            <button
              type="button"
              onClick={() => navigate('/resources')}
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
