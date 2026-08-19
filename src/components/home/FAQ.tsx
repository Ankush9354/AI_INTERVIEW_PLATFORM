import { useState } from "react";

const faqs = [
  {
    question: "Is InterviewAI free to use?",
    answer:
      "Yes! You can start practicing interviews for free. Premium features will be available later.",
  },
  {
    question: "Can I upload my resume?",
    answer:
      "Yes. The platform will analyze your resume and generate personalized interview questions.",
  },
  {
    question: "Do you support voice interviews?",
    answer:
      "Absolutely! You'll be able to answer using your microphone and receive AI feedback.",
  },
  {
    question: "Can I practice multiple job roles?",
    answer:
      "Yes. You can prepare for Frontend, Backend, Full Stack, HR, Data Science, and many more roles.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-4xl px-6">

        <h2 className="text-center text-4xl font-bold">
          Frequently Asked Questions
        </h2>

        <p className="mt-4 text-center text-slate-600">
          Everything you need to know before getting started.
        </p>

        <div className="mt-12 space-y-4">

          {faqs.map((faq, index) => (

            <div
              key={faq.question}
              className="rounded-xl border border-slate-200"
            >

              <button
                className="flex w-full items-center justify-between p-5 text-left font-semibold"
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              >
                {faq.question}

                <span className="text-2xl">
                  {openIndex === index ? "-" : "+"}
                </span>

              </button>

              {openIndex === index && (
                <div className="px-5 pb-5 text-slate-600">
                  {faq.answer}
                </div>
              )}

            </div>

          ))}

        </div>

      </div>
    </section>
  );
};

export default FAQ;