import { motion } from "framer-motion";
import { FiStar, FiCalendar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const specialists = [
  {
    id: 1,
    name: "Dr. Julian Thorne",
    title: "Cardiologist",
    rating: "4.9",
    reviews: "234",
    image: "/Images/specialist_1.png",
    available: true,
    color:
      "from-blue-50 dark:from-blue-500/20 to-blue-100/40 dark:to-blue-500/5",
  },
  {
    id: 2,
    name: "Dr. Sarah Al-Sayed",
    title: "Pediatrician",
    rating: "4.8",
    reviews: "189",
    image: "/Images/specialist_2.png",
    available: true,
    color:
      "from-violet-50 dark:from-violet-500/20 to-violet-100/40 dark:to-violet-500/5",
  },
  {
    id: 3,
    name: "Dr. Marcus Chen",
    title: "Orthopedic Surgeon",
    rating: "5.0",
    reviews: "411",
    image: "/Images/specialist_3.png",
    available: true,
    color:
      "from-primary/5 dark:from-primary/20 to-primary/10 dark:to-primary/10",
  },
  {
    id: 4,
    name: "Dr. Maria Rodriguez",
    title: "Neurologist",
    rating: "4.7",
    reviews: "156",
    image: "/Images/specialist_4.png",
    available: false,
    color:
      "from-pink-50 dark:from-pink-500/20 to-pink-100/40 dark:to-pink-500/5",
  },
];

function Specialists() {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#F8FAFB] dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-primary/8 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-xs font-bold font-inter tracking-widest text-primary uppercase mb-3">
              Our Team
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-manrope text-tertiary dark:text-white leading-tight">
              Meet the doctors
              <br />
              who have your back.
            </h2>
          </motion.div>
          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            onClick={() => navigate("/appointments")}
            className="text-sm font-semibold text-primary font-inter hover:underline underline-offset-4 whitespace-nowrap flex-shrink-0 mb-1"
          >
            See all doctors →
          </motion.button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {specialists.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-700 hover:border-primary/10 dark:hover:border-primary/30 hover:shadow-xl hover:shadow-primary/8 transition-all duration-300 cursor-pointer flex flex-col"
              onClick={() => navigate("/appointments")}
            >
              {/* Image area */}
              <div
                className={`relative h-48 sm:h-56 bg-gradient-to-b ${doc.color} flex items-end justify-center overflow-hidden pt-4`}
              >
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="w-[78%] h-[88%] object-cover object-top transition-transform duration-500 group-hover:scale-105 z-10 relative drop-shadow-md"
                />
                {/* Availability dot */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white dark:bg-slate-900 rounded-full px-2.5 py-1 shadow-sm z-20">
                  <span
                    className={`w-2 h-2 rounded-full ${doc.available ? "bg-green-400 animate-pulse" : "bg-gray-300 dark:bg-gray-600"}`}
                  />
                  <span className="text-[11px] font-semibold text-tertiary dark:text-white font-inter">
                    {doc.available ? "Available" : "Busy"}
                  </span>
                </div>
                {/* Rating */}
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-white dark:bg-slate-900 rounded-full px-2.5 py-1 shadow-sm z-20">
                  <FiStar className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-[11px] font-bold text-tertiary dark:text-white font-inter">
                    {doc.rating}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold font-manrope text-tertiary dark:text-white text-base mb-0.5">
                  {doc.name}
                </h3>
                <p className="text-xs text-neutral dark:text-slate-400 font-inter mb-1">
                  {doc.title}
                </p>
                <p className="text-[11px] text-neutral/70 dark:text-slate-500 font-inter mb-5">
                  {doc.reviews} reviews
                </p>
                <button className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary dark:bg-slate-700/50 text-tertiary dark:text-white hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white text-sm font-semibold font-inter transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                  <FiCalendar className="w-3.5 h-3.5" />
                  Book Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Specialists;
