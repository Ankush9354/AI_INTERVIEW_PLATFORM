const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Netflix",
  "Adobe",
];

const TrustedBy = () => {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">

        <p className="text-center text-sm font-semibold uppercase tracking-widest text-slate-500">
          Trusted by 10,000+ Students Preparing For
        </p>

        <div className="mt-10 grid grid-cols-2 gap-6 text-center md:grid-cols-3 lg:grid-cols-6">

          {companies.map((company) => (
            <div
              key={company}
              className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-lg font-bold text-slate-700 transition hover:scale-105 hover:bg-blue-50 hover:text-blue-600"
            >
              {company}
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default TrustedBy;