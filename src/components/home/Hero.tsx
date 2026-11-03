
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const Hero = () => {
  return (
    <section className="mx-auto flex min-h-[85vh] max-w-7xl flex-col items-center justify-between gap-12 px-6 py-16 md:flex-row">

      {/* Left Content */}
      <motion.div
        className="flex-1"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-600">
          🚀 AI Powered Interview Preparation
        </p>

        <h1 className="text-5xl font-extrabold leading-tight text-slate-900 md:text-6xl">
          Ace Your{" "}
          <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dream Job
          </span>{" "}
          with AI
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
          Practice real interview questions, receive instant AI feedback,
          improve your communication skills, and boost your confidence before
          your next interview.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link to="/signup">
            <Button>Start Free</Button>
          </Link>

          <a href="/#features">
            <Button variant="secondary">Learn More</Button>
          </a>
        </div>

        {/* Stats */}
        <div className="mt-12 flex flex-wrap gap-8">
          <div>
            <h2 className="text-3xl font-bold text-blue-600">10K+</h2>
            <p className="text-slate-600">Mock Interviews</p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-blue-600">95%</h2>
            <p className="text-slate-600">Success Rate</p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-blue-600">24/7</h2>
            <p className="text-slate-600">AI Assistance</p>
          </div>
        </div>
      </motion.div>

      {/* Right Side */}
      <motion.div
        className="flex flex-1 justify-center"
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="flex h-96 w-96 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-2xl">
          <span className="text-[150px]">🤖</span>
        </div>
      </motion.div>

    </section>
  );
};

export default Hero;
