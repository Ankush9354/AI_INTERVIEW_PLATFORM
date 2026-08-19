import { motion } from "framer-motion";
import {
  FaFileUpload,
  FaRobot,
  FaMicrophone,
  FaChartLine,
} from "react-icons/fa";

const steps = [
  {
    icon: FaFileUpload,
    title: "Upload Resume",
    description:
      "Upload your resume and choose the job role you want to prepare for.",
  },
  {
    icon: FaRobot,
    title: "AI Generates Questions",
    description:
      "Our AI creates personalized technical and HR interview questions.",
  },
  {
    icon: FaMicrophone,
    title: "Practice Answers",
    description:
      "Answer questions using your voice or by typing your responses.",
  },
  {
    icon: FaChartLine,
    title: "Receive AI Feedback",
    description:
      "Get detailed scores, strengths, weaknesses, and improvement tips.",
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">

        <h2 className="text-center text-4xl font-bold">
          How It Works
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
          Prepare smarter with our AI-powered interview process in four simple
          steps.
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.2,
                }}
                className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <Icon className="text-3xl text-blue-600" />
                </div>

                <h3 className="text-xl font-semibold">
                  {step.title}
                </h3>

                <p className="mt-4 text-slate-600">
                  {step.description}
                </p>
              </motion.div>
            );
          })}

        </div>

      </div>
    </section>
  );
};

export default HowItWorks;