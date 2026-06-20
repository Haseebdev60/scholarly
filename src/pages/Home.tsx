import { useEffect, useState } from 'react'
import { ArrowRightIcon, PlayCircleIcon, AcademicCapIcon, BoltIcon, CheckBadgeIcon, UserGroupIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { BentoGrid, BentoGridItem } from '../components/BentoGrid'
import { GlassCard } from '../components/GlassCard'
import { features, testimonials } from '../data'
import { publicApi } from '../lib/api'
import { fadeUp, staggerContainer } from '../lib/utils'

type HomeProps = {
  onOpenAuth: (mode: 'login' | 'register', role?: 'student' | 'teacher') => void
  onMessage: (id: string, name: string) => void
}

const Home = ({ onOpenAuth, onMessage }: HomeProps) => {
  const [highlightTeachers, setHighlightTeachers] = useState<any[]>([])

  useEffect(() => {
    publicApi.getTeachers()
      .then(teachers => setHighlightTeachers(teachers.slice(0, 3)))
      .catch(console.error)
  }, [])

  return (
    <div className="overflow-hidden bg-white dark:bg-slate-950">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col justify-center pt-32 pb-40 lg:pt-48 lg:pb-48 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/40 via-slate-950 to-slate-950" />
          <div className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-brand-600/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-accent-500/10 blur-3xl pointer-events-none" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div
            initial="initial" animate="animate" variants={staggerContainer}
            className="max-w-3xl mx-auto text-center space-y-8"
          >
            <motion.div variants={fadeUp}>
              <Badge className="bg-white/10 text-brand-300 border-white/20 inline-flex py-1.5 px-4 rounded-full font-medium">
                Scholarly 2.0 is live
              </Badge>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-black font-display tracking-tight text-white leading-[1.08] text-balance">
              Learn <span className="text-gradient">Smarter</span> With AI.
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto leading-relaxed text-balance font-medium">
              An AI-powered modern learning platform designed to help students study faster, smarter, and more effectively.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <Button size="lg" onClick={() => onOpenAuth('register', 'student')} className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-brand-600 to-brand-500 text-white border-none rounded-2xl">
                Start Learning Free
              </Button>
              <Link to="/courses">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-bold bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-2xl group">
                  Explore Courses <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="pt-8 flex items-center gap-6 justify-center">
              <div className="flex -space-x-3">
                {['A', 'B', 'C', 'D'].map((letter) => (
                  <div key={letter} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
                    {letter}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-white font-bold text-xs">+10k</div>
              </div>
              <div className="text-sm font-medium text-slate-300 text-left">
                <div className="flex text-amber-400 mb-1">
                  {[...Array(5)].map((_, i) => <StarIconSolid key={i} className="h-4 w-4" />)}
                </div>
                Loved by students globally
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950 relative border-t border-slate-200 dark:border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeUp} className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-brand-600 dark:text-brand-400 font-bold tracking-widest uppercase text-sm mb-4 font-display">Why Scholarly</h2>
            <p className="text-4xl md:text-5xl font-black font-display tracking-tight text-slate-900 dark:text-white text-balance">
              Everything you need to <span className="text-gradient">excel.</span>
            </p>
          </motion.div>

          <BentoGrid className="max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <BentoGridItem
                key={i}
                title={feature.title}
                description={feature.description}
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 items-center justify-center">
                    {i === 0 && <AcademicCapIcon className="h-16 w-16 text-brand-500/50" />}
                    {i === 1 && <PlayCircleIcon className="h-16 w-16 text-accent-500/50" />}
                    {i === 2 && <UserGroupIcon className="h-16 w-16 text-purple-500/50" />}
                    {i === 3 && <BoltIcon className="h-16 w-16 text-amber-500/50" />}
                    {i >= 4 && <StarIcon className="h-16 w-16 text-emerald-500/50" />}
                  </div>
                }
                icon={
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 border border-slate-200 dark:border-white/10">
                    {i === 0 && <AcademicCapIcon className="h-5 w-5" />}
                    {i === 1 && <PlayCircleIcon className="h-5 w-5" />}
                    {i === 2 && <UserGroupIcon className="h-5 w-5" />}
                    {i === 3 && <BoltIcon className="h-5 w-5" />}
                    {i >= 4 && <StarIcon className="h-5 w-5" />}
                  </div>
                }
                className={i === 0 || i === 3 ? "md:col-span-2" : ""}
              />
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* Teachers */}
      <section className="py-24 bg-white dark:bg-slate-900 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeUp} className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black font-display text-slate-900 dark:text-white tracking-tight">Learn from <span className="text-gradient">experts.</span></h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 font-medium">
                Connect directly with vetted specialists dedicated to your academic success.
              </p>
            </div>
            <Link to="/teachers">
              <Button variant="outline" className="hidden md:flex items-center gap-2 rounded-xl h-12 px-6 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 font-bold group">
                Meet all teachers <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
            {highlightTeachers.map((teacher) => (
              <motion.div key={teacher._id} variants={fadeUp}>
                <GlassCard glowHover className="h-full bg-slate-50 dark:bg-slate-950 rounded-2xl p-8 border border-slate-200 dark:border-white/5">
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-20 w-20 rounded-2xl overflow-hidden shadow-md bg-brand-600 flex items-center justify-center text-white font-bold text-2xl">
                      {teacher.avatar ? (
                        <img src={teacher.avatar} alt={teacher.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                      ) : (
                        teacher.name.charAt(0)
                      )}
                    </div>
                    <Button size="sm" variant="secondary" className="rounded-xl font-bold" onClick={() => onMessage(teacher._id, teacher.name)}>
                      Message
                    </Button>
                  </div>

                  <h3 className="text-xl font-black font-display text-slate-900 dark:text-white mb-1">{teacher.name}</h3>
                  <div className="text-sm text-brand-600 dark:text-accent-400 font-bold tracking-wide uppercase mb-3">Senior Lecturer</div>

                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {teacher.bio || 'Experienced educator passionate about helping students achieve their academic goals.'}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {teacher.assignedSubjects?.slice(0, 2).map((subject: any) => (
                      <span key={subject._id} className="px-3 py-1 rounded-lg bg-white dark:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                        {subject.title}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-950 text-white relative overflow-hidden border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 mb-12 text-center">
          <motion.h2 initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeUp} className="text-4xl md:text-5xl font-black font-display mb-6 tracking-tight">
            Loved by <span className="text-gradient">thousands.</span>
          </motion.h2>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="flex w-fit animate-marquee gap-6 hover:[animation-play-state:paused] pr-6">
            {[...testimonials, ...testimonials].map((testimonial, idx) => (
              <div key={idx} className="w-[360px] shrink-0 bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => <StarIconSolid key={i} className="h-4 w-4" />)}
                </div>
                <p className="text-base leading-relaxed mb-6 text-slate-300">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center font-bold text-white">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.context}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-16 text-center">
          <Button size="lg" className="h-14 px-8 text-lg font-bold bg-white text-slate-900 hover:bg-slate-100 rounded-2xl" onClick={() => onOpenAuth('register', 'student')}>
            Start Your Journey
          </Button>
        </div>
      </section>
    </div>
  )
}

export default Home
