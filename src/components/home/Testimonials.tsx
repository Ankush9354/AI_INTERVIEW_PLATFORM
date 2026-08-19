import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Ankush Sharma",
    role: "Frontend Developer",
    review:
      "This platform completely changed the way I prepare for interviews. The AI feedback is incredibly useful.",
  },
  {
    name: "Rahul Verma",
    role: "Software Engineer",
    review:
      "The mock interviews feel realistic, and I became much more confident before my actual interview.",
  },
  {
    name: "Priya Singh",
    role: "UI/UX Designer",
    review:
      "Beautiful interface and amazing AI suggestions. Highly recommended for interview preparation.",
  },
];

const Testimonials = () => {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">

        <h2 className="text-center text-4xl font-bold">
          What Our Users Say
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
          Thousands of students and professionals trust InterviewAI for their interview preparation.
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {testimonials.map((user, index) => (

            <motion.div
              key={user.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.2,
              }}
              className="rounded-2xl bg-white p-8 shadow-lg"
            >

              <div className="mb-5 text-yellow-400 text-2xl">
                ⭐⭐⭐⭐⭐
              </div>

              <p className="italic text-slate-600">
                "{user.review}"
              </p>

              <div className="mt-8">
                <h3 className="font-bold text-lg">
                  {user.name}
                </h3>

                <p className="text-slate-500">
                  {user.role}
                </p>
              </div>

            </motion.div>

          ))}

        </div>

      </div>
    </section>
  );
};

export default Testimonials;