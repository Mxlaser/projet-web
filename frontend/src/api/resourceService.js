import { api } from './axios';

export const resourceService = {
  getAllResources: async () => {
    const response = await api.get('/api/resources');
    return response.data;
  },

  getResourceById: async (id) => {
    const response = await api.get(`/api/resources/${id}`);
    return response.data;
  },

  createResource: async (resourceData) => {
    const formData = new FormData();
    
    formData.append('title', resourceData.title);
    formData.append('type', resourceData.type || 'note');
    if (resourceData.categoryId) {
      formData.append('categoryId', resourceData.categoryId);
    }
    if (resourceData.content) {
      formData.append('content', JSON.stringify(resourceData.content));
    }
    if (resourceData.tags && Array.isArray(resourceData.tags)) {
      formData.append('tags', JSON.stringify(resourceData.tags));
    }
    
    if (resourceData.file) {
      formData.append('file', resourceData.file);
    }

    const response = await api.post('/api/resources', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateResource: async (id, resourceData) => {
    if (resourceData.file) {
      const formData = new FormData();
      
      formData.append('title', resourceData.title);
      formData.append('type', resourceData.type || 'note');
      if (resourceData.categoryId) {
        formData.append('categoryId', resourceData.categoryId);
      }
      if (resourceData.content) {
        formData.append('content', JSON.stringify(resourceData.content));
      }
      if (resourceData.tags && Array.isArray(resourceData.tags)) {
        formData.append('tags', JSON.stringify(resourceData.tags));
      }
      
      formData.append('file', resourceData.file);

      const response = await api.put(`/api/resources/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      const response = await api.put(`/api/resources/${id}`, {
        title: resourceData.title,
        type: resourceData.type,
        content: resourceData.content,
        categoryId: resourceData.categoryId,
        tags: resourceData.tags,
      });
      return response.data;
    }
  },

  deleteResource: async (id) => {
    const response = await api.delete(`/api/resources/${id}`);
    return response.data;
  },
};
