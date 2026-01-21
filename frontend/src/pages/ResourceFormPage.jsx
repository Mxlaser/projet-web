import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { resourceService } from '../api/resourceService';
import { categoryService } from '../api/categoryService';

export default function ResourceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('note');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setTitle(resource.title);
      setDescription(resource.content?.description || '');
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

      const resourceData = {
        title,
        type,
        content: {
          description,
        },
        categoryId: categoryId ? Number(categoryId) : null,
        tags: tagsArray,
        file,
      };

      if (isEdit) {
        await resourceService.updateResource(id, {
          title,
          type,
          content: {
            description,
          },
          categoryId: categoryId ? Number(categoryId) : null,
          tags: tagsArray,
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

            <div>
              <label className="block text-sm font-medium text-[#252525] mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
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

            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-2">
                  Fichier (optionnel)
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full h-10 rounded-md border border-[#c3c1e5] px-4 text-sm text-[#252525] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/60"
                />
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
