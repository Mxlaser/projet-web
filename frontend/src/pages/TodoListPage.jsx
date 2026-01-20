import { useState } from 'react';

export default function TodoListPage() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Note #1', completed: false },
    { id: 2, text: 'Note #2', completed: true },
    { id: 3, text: 'Note #3', completed: false },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleCreateNote = () => {
    if (newNoteTitle.trim()) {
      const newTodo = {
        id: todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1,
        text: newNoteTitle.trim(),
        completed: false,
      };
      setTodos([...todos, newTodo]);
      setNewNoteTitle('');
      setIsModalOpen(false);
    }
  };

  const handleCancel = () => {
    setNewNoteTitle('');
    setIsModalOpen(false);
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      // TODO: Implémenter la logique de création de catégorie
      console.log('Création de catégorie:', newCategoryName.trim());
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
    }
  };

  const handleCancelCategory = () => {
    setNewCategoryName('');
    setIsCategoryModalOpen(false);
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'completed') return matchesSearch && todo.completed;
    if (filter === 'active') return matchesSearch && !todo.completed;
    return matchesSearch;
  });

  return (
    <div 
      className="min-h-screen bg-[#f7f7f7] flex flex-col items-center py-10 px-4"
      onClick={() => {
        if (isDropdownOpen) setIsDropdownOpen(false);
        if (isFabMenuOpen) setIsFabMenuOpen(false);
      }}
    >
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <h1 className="text-[26px] font-medium text-[#252525] uppercase">
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
                className="w-full h-[38px] rounded-[5px] border border-[#6c63ff] px-4 pr-10 text-sm text-[#252525] placeholder:text-[#c3c1e5] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/60"
              />
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#252525] pointer-events-none"
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
              onClick={() => setIsModalOpen(true)}
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
                <div className="absolute top-full mt-1 right-0 bg-white border border-[#e5e7eb] rounded-[5px] shadow-md min-w-[120px] z-10 overflow-hidden">
                  <button
                    onClick={() => {
                      setFilter('all');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      filter === 'all'
                        ? 'bg-[rgba(108,99,255,0.1)] text-[#6c63ff]'
                        : 'text-[#374151] hover:bg-gray-50'
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
                        : 'text-[#374151] hover:bg-gray-50'
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
                        : 'text-[#374151] hover:bg-gray-50'
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
            <button className="w-[38px] h-[38px] bg-[#6c63ff] rounded-[5px] flex items-center justify-center hover:bg-[#5a52e0] transition-colors">
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
            </button>
          </div>
        </div>

        {/* Vos ressources */}
        <div className="relative w-full">
          <div className="space-y-0">
            {filteredTodos.map((todo, index) => (
              <div key={todo.id} className="group relative">
                {/* Separator Line */}
                {index > 0 && (
                  <div className="absolute top-0 left-0 right-0 h-px bg-[#e0e0e0]"></div>
                )}

                <div className="flex items-center gap-4 py-4 px-2 hover:bg-white/50 transition-colors">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-[26px] h-[26px] rounded-[2px] border-2 border-[#6c63ff] flex items-center justify-center flex-shrink-0 ${
                      todo.completed ? 'bg-[#6c63ff]' : 'bg-transparent'
                    }`}
                  >
                    {todo.completed && (
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

                  {/* Todo Text */}
                  <p
                    className={`flex-1 text-xl uppercase font-medium ${
                      todo.completed
                        ? 'line-through text-[rgba(37,37,37,0.5)]'
                        : 'text-[#252525]'
                    }`}
                  >
                    {todo.text}
                  </p>

                  {/* Action Icons (visible on hover) */}
                  <div className="flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Edit Icon */}
                    <button className="w-[18px] h-[18px] text-[#252525] hover:text-[#6c63ff] transition-colors">
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
                    <button className="w-[18px] h-[18px] text-[#252525] hover:text-red-500 transition-colors">
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
            ))}
          </div>
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
                setIsModalOpen(true);
              }}
              className="px-4 py-2 rounded-[8px] bg-white shadow-lg border border-[#e5e7eb] text-sm text-[#252525] hover:bg-[#f3f4ff] transition transform origin-bottom-right translate-y-1 opacity-100"
            >
              Ajouter une ressource
            </button>
            <button
              onClick={() => {
                setIsFabMenuOpen(false);
                setIsCategoryModalOpen(true);
              }}
              className="px-4 py-2 rounded-[8px] bg-white shadow-lg border border-[#e5e7eb] text-sm text-[#252525] hover:bg-[#f3f4ff] transition transform origin-bottom-right translate-y-1 opacity-100"
            >
              Créer une catégorie
            </button>
          </div>
        )}
      </div>

      {/* Modal for Creating New Note */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleCancel}
        >
          <div 
            className="bg-white rounded-[16px] p-6 w-full max-w-md mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#252525]">
                Créer une nouvelle ressource
              </h2>
              <button
                onClick={handleCancel}
                className="w-6 h-6 flex items-center justify-center text-[#252525] hover:text-[#6c63ff] transition-colors"
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
            <div className="mb-6">
              <input
                type="text"
                placeholder="Titre de la note"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateNote();
                  }
                }}
                className="w-full h-12 rounded-[5px] border border-[#c3c1e5] px-4 text-sm text-[#252525] placeholder:text-[#c3c1e5] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/60"
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                onClick={handleCancel}
                className="px-6 py-2 rounded-[5px] border border-[#e5e7eb] bg-white text-[#374151] text-sm font-medium uppercase hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateNote}
                className="px-6 py-2 rounded-[5px] bg-[#6c63ff] text-[#f7f7f7] text-sm font-medium uppercase hover:bg-[#5a52e0] transition-colors"
              >
                Créer
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
            className="bg-white rounded-[16px] p-6 w-full max-w-md mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#252525]">
                Créer une nouvelle catégorie
              </h2>
              <button
                onClick={handleCancelCategory}
                className="w-6 h-6 flex items-center justify-center text-[#252525] hover:text-[#6c63ff] transition-colors"
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
            <div className="mb-6">
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
                className="w-full h-12 rounded-[5px] border border-[#c3c1e5] px-4 text-sm text-[#252525] placeholder:text-[#c3c1e5] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/60"
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                onClick={handleCancelCategory}
                className="px-6 py-2 rounded-[5px] border border-[#e5e7eb] bg-white text-[#374151] text-sm font-medium uppercase hover:bg-gray-50 transition-colors"
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
