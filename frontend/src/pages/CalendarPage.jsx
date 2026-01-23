import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceService } from '../api/resourceService';
import { useTheme } from '../context/ThemeContext';

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

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatDateShort = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit'
  });
};

const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  // Ajuster pour que lundi soit le premier jour (0 = dimanche, 1 = lundi, etc.)
  const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
  
  const days = [];
  
  // Ajouter les jours du mois précédent pour compléter la première semaine
  const prevMonth = new Date(year, month - 1, 0);
  const daysInPrevMonth = prevMonth.getDate();
  for (let i = adjustedStartingDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false
    });
  }
  
  // Ajouter les jours du mois actuel
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      date: new Date(year, month, day),
      isCurrentMonth: true
    });
  }
  
  // Ajouter les jours du mois suivant pour compléter la dernière semaine
  const remainingDays = 42 - days.length; // 6 semaines * 7 jours
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      date: new Date(year, month + 1, day),
      isCurrentMonth: false
    });
  }
  
  return days;
};

const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CalendarPage() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadResources();
  }, []);

  // Recharger les ressources quand on revient sur la page (après création/modification)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadResources();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await resourceService.getAllResources();
      setResources(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement des ressources');
    } finally {
      setLoading(false);
    }
  };

  const resourcesByDate = useMemo(() => {
    const grouped = {};
    resources.forEach(resource => {
      const dateKey = getDateKey(new Date(resource.createdAt));
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(resource);
    });
    return grouped;
  }, [resources]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsCreateModalOpen(true);
  };

  const handleResourceClick = (resource) => {
    setSelectedResource(resource);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedResource(null);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setSelectedDate(null);
  };

  const handleCreateResource = () => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    navigate(`/resources/new?date=${dateStr}`);
  };

  const handleEdit = (id) => {
    handleCloseDetailModal();
    navigate(`/resources/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (deletingId === id) return;
    setDeletingId(id);
    
    try {
      await resourceService.deleteResource(id);
      await loadResources();
      handleCloseDetailModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
      setDeletingId(null);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentDate);
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div 
      className="min-h-screen bg-[#f7f7f7] dark:bg-[#1a1a1a] flex flex-col items-center py-10 px-4"
    >
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex items-center gap-4 w-full justify-between">
            <button
              onClick={() => navigate('/resources')}
              className="px-4 py-2 bg-white dark:bg-[#2a2a2a] border border-[#e5e7eb] dark:border-[#404040] text-[#374151] dark:text-[#e5e5e5] rounded-[5px] text-sm hover:bg-gray-50 dark:hover:bg-[#333333] transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour à la liste
            </button>
            <h1 className="text-[26px] font-medium text-[#252525] dark:text-[#f7f7f7] uppercase">
              Calendrier
            </h1>
            <div className="w-[120px]"></div> {/* Spacer pour centrer le titre */}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4 w-full justify-center">
            <button
              onClick={goToPreviousMonth}
              className="w-10 h-10 bg-[#6c63ff] text-[#f7f7f7] rounded-[5px] flex items-center justify-center hover:bg-[#5a52e0] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-medium text-[#252525] dark:text-[#f7f7f7] capitalize">
                {monthName}
              </h2>
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-white dark:bg-[#2a2a2a] border border-[#e5e7eb] dark:border-[#404040] text-[#374151] dark:text-[#e5e5e5] rounded-[5px] text-sm hover:bg-gray-50 dark:hover:bg-[#333333] transition-colors"
              >
                Aujourd'hui
              </button>
            </div>

            <button
              onClick={goToNextMonth}
              className="w-10 h-10 bg-[#6c63ff] text-[#f7f7f7] rounded-[5px] flex items-center justify-center hover:bg-[#5a52e0] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Message */}
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

        {/* Calendar Grid */}
        {loading ? (
          <div className="text-center py-8 text-[#666] dark:text-[#999]">Chargement...</div>
        ) : (
          <div className="bg-white dark:bg-[#2a2a2a] rounded-[8px] border border-[#e5e7eb] dark:border-[#404040] overflow-hidden">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 border-b border-[#e5e7eb] dark:border-[#404040]">
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className="p-3 text-center text-sm font-medium text-[#666] dark:text-[#999] border-r border-[#e5e7eb] dark:border-[#404040] last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {days.map((dayObj, index) => {
                const dateKey = getDateKey(dayObj.date);
                const dayResources = resourcesByDate[dateKey] || [];
                const isToday = getDateKey(dayObj.date) === getDateKey(today);
                const isSelected = selectedDate && getDateKey(dayObj.date) === getDateKey(selectedDate);
                
                // Vérifier si la date est passée (avant aujourd'hui)
                const dayDate = new Date(dayObj.date);
                dayDate.setHours(0, 0, 0, 0);
                const isPast = dayDate < today && !isToday;

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] border-r border-b border-[#e5e7eb] dark:border-[#404040] last:border-r-0 p-2 ${
                      !dayObj.isCurrentMonth
                        ? 'bg-gray-50 dark:bg-[#1f1f1f] opacity-50'
                        : isPast
                        ? 'bg-gray-100 dark:bg-[#1f1f1f] opacity-60'
                        : 'bg-white dark:bg-[#2a2a2a]'
                    } ${
                      isToday
                        ? 'ring-2 ring-[#6c63ff] ring-inset'
                        : ''
                    } ${
                      isPast
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:bg-gray-50 dark:hover:bg-[#333333] cursor-pointer'
                    } transition-colors relative`}
                    onClick={() => !isPast && handleDateClick(dayObj.date)}
                  >
                    {/* Day Number */}
                    <div className={`text-sm font-medium mb-1 ${
                      isToday
                        ? 'text-[#6c63ff]'
                        : isPast
                        ? 'text-[#999] dark:text-[#666]'
                        : dayObj.isCurrentMonth
                        ? 'text-[#252525] dark:text-[#f7f7f7]'
                        : 'text-[#999] dark:text-[#666]'
                    }`}>
                      {dayObj.date.getDate()}
                    </div>

                    {/* Resources */}
                    <div className="space-y-1 max-h-[80px] overflow-y-auto">
                      {dayResources.slice(0, 3).map((resource) => (
                        <div
                          key={resource.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResourceClick(resource);
                          }}
                          className={`text-xs px-2 py-1 rounded truncate transition-colors cursor-pointer ${
                            isPast
                              ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-300'
                              : 'bg-[#6c63ff] text-white hover:bg-[#5a52e0]'
                          }`}
                          title={resource.title}
                        >
                          {resource.title}
                        </div>
                      ))}
                      {dayResources.length > 3 && (
                        <div className={`text-xs px-2 ${
                          isPast
                            ? 'text-[#999] dark:text-[#666]'
                            : 'text-[#666] dark:text-[#999]'
                        }`}>
                          +{dayResources.length - 3} autre{dayResources.length - 3 > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedResource && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleCloseDetailModal}
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
                onClick={handleCloseDetailModal}
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
              {/* Date */}
              <div>
                <span className="text-xs font-medium text-[#666] dark:text-[#999] uppercase">Date de création</span>
                <p className="text-sm text-[#252525] dark:text-[#e5e5e5] mt-1">
                  {formatDate(selectedResource.createdAt) || '—'}
                </p>
              </div>

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
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-4 border-t border-[#e5e7eb] dark:border-[#404040]">
              <button
                onClick={() => handleDelete(selectedResource.id)}
                disabled={deletingId === selectedResource.id}
                className="px-6 py-2 rounded-[5px] border border-red-200 dark:border-red-800 bg-white dark:bg-[#2a2a2a] text-red-600 dark:text-red-400 text-sm font-medium uppercase hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingId === selectedResource.id ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Suppression...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </>
                )}
              </button>
              <button
                onClick={() => handleEdit(selectedResource.id)}
                className="px-6 py-2 rounded-[5px] bg-[#6c63ff] text-[#f7f7f7] text-sm font-medium uppercase hover:bg-[#5a52e0] transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Resource Modal */}
      {isCreateModalOpen && selectedDate && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleCloseCreateModal}
        >
          <div 
            className="bg-white dark:bg-[#2a2a2a] rounded-[16px] p-6 w-full max-w-md mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#252525] dark:text-[#f7f7f7]">
                Créer une ressource
              </h2>
              <button
                onClick={handleCloseCreateModal}
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
            <div className="mb-6 space-y-4">
              <div>
                <span className="text-xs font-medium text-[#666] dark:text-[#999] uppercase">Date sélectionnée</span>
                <p className="text-sm text-[#252525] dark:text-[#e5e5e5] mt-1">
                  {formatDate(selectedDate.toISOString())}
                </p>
              </div>
              <p className="text-sm text-[#666] dark:text-[#999]">
                Vous allez être redirigé vers le formulaire de création de ressource pour cette date.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                onClick={handleCloseCreateModal}
                className="px-6 py-2 rounded-[5px] border border-[#e5e7eb] dark:border-[#404040] bg-white dark:bg-[#2a2a2a] text-[#374151] dark:text-[#e5e5e5] text-sm font-medium uppercase hover:bg-gray-50 dark:hover:bg-[#333333] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateResource}
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
