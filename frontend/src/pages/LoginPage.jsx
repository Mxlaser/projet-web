import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/authService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      setToken(data.token);
      navigate('/todos');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col items-center justify-start">
      {/* Logo */}
      <div className="mt-16 flex flex-col items-center gap-4">
        <div className="bg-[#6c63ff] text-white w-24 h-24 flex items-center justify-center relative overflow-hidden">
          <span className="absolute text-[52px] left-3 top-[-2px] font-serif">T</span>
          <span className="absolute text-[52px] right-3 top-[10px] font-serif">D</span>
        </div>

        {/* Titre */}
        <h1 className="text-4xl font-semibold text-[#252525] mt-6">
          Connexion
        </h1>
      </div>

      {/* Formulaire */}
      <div className="mt-12 w-full max-w-xl px-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-10 rounded-md border border-[#c3c1e5] px-4 text-sm text-[#252525] placeholder:text-[#c3c1e5] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/60"
          />
          <input
            type="password"
            placeholder="********************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-10 rounded-md border border-[#c3c1e5] px-4 text-sm text-[#252525] placeholder:text-[#c3c1e5] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/60"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 h-11 w-full max-w-xs mx-auto rounded-md bg-[#6c63ff] text-[#f7f7f7] text-sm font-medium tracking-wide uppercase hover:bg-[#5a52e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion...' : 'Valider'}
          </button>
        </form>

        {/* Lien d'inscription */}
        <p className="mt-6 text-center text-xs italic text-[#cccccc]">
          Pas encore de compte ?{" "}
          <Link to="/signup" className="text-[#6c63ff] underline">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}
