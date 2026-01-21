import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/AuthService";

export default function SignupPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Veuillez renseigner email et mot de passe.");
      return;
    }

    try {
      setLoading(true);

      // Ton backend est censé être sur /api/auth/register
      await register({ email, password });

      setSuccess("Compte créé. Redirection vers la connexion...");
      setTimeout(() => navigate("/login", { replace: true }), 600);
    } catch (err) {
      // Affiche un message simple + utile
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Inscription échouée. Vérifie si l'email existe déjà.";
      setError(typeof msg === "string" ? msg : "Inscription échouée.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col items-center justify-start">
      <div className="mt-16 flex flex-col items-center gap-4">
        <div className="bg-[#6c63ff] text-white w-24 h-24 flex items-center justify-center relative overflow-hidden">
          <span className="absolute text-[52px] left-3 top-[-2px] font-serif">T</span>
          <span className="absolute text-[52px] right-3 top-[10px] font-serif">D</span>
        </div>

        <h1 className="text-4xl font-semibold text-[#252525] mt-6">
          Inscription
        </h1>
      </div>

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
            placeholder="********************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 rounded-md border border-[#c3c1e5] px-4 text-sm focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/60"
          />

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          {success && <p className="text-sm text-green-600 text-center">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 h-11 w-full max-w-xs mx-auto rounded-md bg-[#6c63ff] text-white text-sm font-medium tracking-wide uppercase hover:bg-[#5a52e0] transition-colors disabled:opacity-60"
          >
            {loading ? "Création..." : "Valider"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs italic text-[#cccccc]">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-[#6c63ff] underline">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}
