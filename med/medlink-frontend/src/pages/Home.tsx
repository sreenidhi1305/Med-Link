import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MapPin, ShieldCheck, HeartPulse, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Glow background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[30rem] w-[30rem] rounded-full bg-teal-400/20 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm text-emerald-700 shadow-sm ring-1 ring-emerald-200">
            <ShieldCheck className="h-4 w-4" /> Trusted, real‑time availability
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Find the nearest life‑saving drugs in seconds
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            MedLink helps you locate critical medicines instantly with live inventory, trust scores, and a beautiful map experience.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              to="/finder"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition-colors"
            >
              <MapPin className="h-5 w-5" /> Open Finder
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-emerald-700 ring-1 ring-emerald-200 hover:ring-emerald-300 transition"
            >
              <Sparkles className="h-5 w-5" /> See Features
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Hyperlocal & Fast',
              desc: 'Real‑time results from nearby pharmacies with distance and ETA.',
            },
            {
              title: 'Trust Scores',
              desc: 'See ratings, reliability badges, and verified stock levels.',
            },
            {
              title: 'Bilingual Voice',
              desc: 'Hindi/English voice search for fast and friendly access.',
            },
            {
              title: 'Beautiful Maps',
              desc: 'Smooth markers, clustering, and animated transitions.',
            },
            {
              title: 'Privacy‑First',
              desc: 'Your location is used only to serve you better—never sold.',
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">{f.title}</h3>
              </div>
              <p className="mt-3 text-sm text-gray-600">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
