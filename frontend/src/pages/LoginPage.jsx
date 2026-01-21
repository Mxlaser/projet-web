export default function LoginPage() {
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
        <form className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="email@example.com"
            className="w-full h-10 rounded-md border border-[#c3c1e5] px-4 text-sm text-[#252525] placeholder:text-[#c3c1e5] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/60"
          />
          <input
            type="password"
            placeholder="********************"
            className="w-full h-10 rounded-md border border-[#c3c1e5] px-4 text-sm text-[#252525] placeholder:text-[#c3c1e5] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/60"
          />

          <button
            type="submit"
            className="mt-6 h-11 w-full max-w-xs mx-auto rounded-md bg-[#6c63ff] text-[#f7f7f7] text-sm font-medium tracking-wide uppercase hover:bg-[#5a52e0] transition-colors"
          >
            Valider
          </button>
        </form>

        {/* Lien d'inscription */}
        <p className="mt-6 text-center text-xs italic text-[#cccccc]">
          Pas encore de compte ?{" "}
          <a href="/signup" className="text-[#6c63ff] underline">
            Inscrivez-vous
          </a>
        </p>
      </div>
    </div>
  );
}
