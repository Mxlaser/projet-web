import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login } from "../services/AuthService";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Veuillez renseigner email et mot de passe.");
      return;
    }

    try {
      setLoading(true);

      const data = await login(email, password);

      const token =
        data.token || data.accessToken || data.access_token;

      if (!token) {
        throw new Error("Token manquant dans la réponse API");
      }

      setToken(token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError("Connexion échouée. Vérifie tes identifiants.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col items-center justify-start">
      {/* Logo */}
      <div className="mt-16 flex flex-col items-center gap-4">
        <div className="bg-[#6c63ff] text-white w-24 h-24 flex items-center justify-center relative overflow-hidden">
          <span className="absolute text-[52px] left-3 top-[-2px] font-serif">
            T
          </span>
          <span className="absolute text-[52px] right-3 top-[10px] font-serif">
            D
          </span>
        </div>

        <h1 className="text-4xl font-semibold text-[#252525] mt-6">
          Connexion
        </h1>
      </div>

      {/* Formulaire */}
      <div className="mt-12 w-full max-w-xl px-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 rounded-md border border-[#c3c1e5] px-4 text-sm focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/60"
          />

          <input
            type="password"
            placeholder="*************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 rounded-md border border-[#c3c1e5] px-4 text-sm focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/60"
          />

          {error && (
            <p className="text-sm text-red-600 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 h-11 w-full max-w-xs mx-auto rounded-md bg-[#6c63ff] text-white text-sm font-medium uppercase hover:bg-[#5a52e0] disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Valider"}
          </button>
        </form>

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
