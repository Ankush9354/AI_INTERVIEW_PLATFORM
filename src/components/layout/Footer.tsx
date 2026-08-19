const Footer = () => {
  return (
    <footer className="bg-slate-900 py-12 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">

        <div>
          <h2 className="text-2xl font-bold">
            Interview<span className="text-blue-400">AI</span>
          </h2>

          <p className="mt-2 text-slate-400">
            Prepare smarter with AI-powered interviews.
          </p>
        </div>

        <div className="flex gap-8 text-slate-300">

          <a href="#features">Features</a>

          <a href="#about">About</a>

          <a href="#pricing">Pricing</a>

          <a href="#">GitHub</a>

        </div>

      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        © 2026 InterviewAI. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;