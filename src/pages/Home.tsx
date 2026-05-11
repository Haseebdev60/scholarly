import { useEffect, useState, useRef } from 'react'
import { ArrowRightIcon, PlayCircleIcon, AcademicCapIcon, BoltIcon, CheckBadgeIcon, UserGroupIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { BentoGrid, BentoGridItem } from '../components/BentoGrid'
import { GlassCard } from '../components/GlassCard'
import { features, testimonials } from '../data'
import { publicApi } from '../lib/api'
import { fadeUp, staggerContainer, scaleIn } from '../lib/utils'

type HomeProps = {
  onOpenAuth: (mode: 'login' | 'register', role?: 'student' | 'teacher') => void
  onMessage: (id: string, name: string) => void
}

const Home = ({ onOpenAuth, onMessage }: HomeProps) => {
  const [highlightTeachers, setHighlightTeachers] = useState<any[]>([])
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8])
  const y = useTransform(scrollYProgress, [0, 1], [0, 200])

  useEffect(() => {
    publicApi.getTeachers()
      .then(teachers => setHighlightTeachers(teachers.slice(0, 3)))
      .catch(console.error)
  }, [])

  return (
    <div className="overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Premium Hero Section */}
      <section ref={targetRef} className="relative min-h-screen flex flex-col justify-center pt-32 pb-40 lg:pt-48 lg:pb-48 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 z-0 bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/40 via-slate-950 to-slate-950" />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-brand-600/20 blur-[120px] mix-blend-screen"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.4, 0.2],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-electric-blue/20 blur-[120px] mix-blend-screen"
          />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        </div>

        <motion.div style={{ opacity, scale, y }} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Hero Content */}
            <motion.div 
              initial="initial" animate="animate" variants={staggerContainer}
              className="text-left space-y-8"
            >
              <motion.div variants={fadeUp}>
                <Badge className="bg-white/10 text-brand-300 border-white/20 shadow-glow backdrop-blur-md inline-flex py-1.5 px-4 rounded-full font-medium">
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-electric-blue"></span>
                    </span>
                    Scholarly 2.0 is live
                  </span>
                </Badge>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-6xl md:text-7xl lg:text-8xl font-black font-display tracking-tighter text-white leading-[1.05] text-balance">
                Learn <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-electric-blue to-purple-glow animate-pulse-slow">Smarter</span> With AI.
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-300 max-w-xl leading-relaxed text-balance font-medium">
                An AI-powered modern learning platform designed to help students study faster, smarter, and more effectively.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" onClick={() => onOpenAuth('register', 'student')} className="h-14 px-8 text-lg font-bold shadow-glow hover:shadow-glow-hover bg-gradient-to-r from-brand-600 to-electric-blue text-white border-none transition-all hover:scale-105 rounded-2xl">
                  Start Learning Free
                </Button>
                <Link to="/courses">
                  <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-bold bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/10 transition-all hover:scale-105 rounded-2xl group">
                    Explore Courses <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div variants={fadeUp} className="pt-8 flex items-center gap-6">
                <div className="flex -space-x-4">
                  {[...Array(4)].map((_, i) => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-12 h-12 rounded-full border-2 border-slate-900 object-cover" alt="Student" />
                  ))}
                  <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-brand-600 flex items-center justify-center text-white font-bold text-xs">+10k</div>
                </div>
                <div className="text-sm font-medium text-slate-300">
                  <div className="flex text-amber-400 mb-1">
                    {[...Array(5)].map((_, i) => <StarIconSolid key={i} className="h-4 w-4" />)}
                  </div>
                  Loved by students globally
                </div>
              </motion.div>
            </motion.div>
            
            {/* Hero Visual */}
            <motion.div initial="initial" animate="animate" variants={scaleIn} className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-600/30 to-electric-blue/30 blur-3xl rounded-full" />
              <div className="relative rotate-2 hover:rotate-0 transition-transform duration-700 group">
                <GlassCard glowHover className="relative rounded-[2.5rem] border-white/10 bg-white/5 shadow-2xl p-2">
                   <img 
                      src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80" 
                      alt="Dashboard Preview" 
                      className="rounded-[2rem] object-cover w-full h-[600px] opacity-90 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                   />
                </GlassCard>
                 
                 {/* Floating Badges */}
                 <motion.div 
                    animate={{ y: [0, -20, 0] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -left-12 top-20 bg-slate-900/80 backdrop-blur-xl border border-white/40 py-4 px-6 pr-8 min-w-max rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-4 pointer-events-none"
                 >
                    <div className="bg-brand-500/20 p-3 rounded-xl text-brand-400"><AcademicCapIcon className="w-6 h-6" /></div>
                    <div>
                      <div className="text-xs text-slate-400 font-bold uppercase">Course Completed</div>
                      <div className="text-white font-bold text-lg">Advanced Math</div>
                    </div>
                 </motion.div>

                 <motion.div 
                    animate={{ y: [0, 20, 0] }} 
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -right-8 bottom-32 bg-slate-900/80 backdrop-blur-xl border border-white/40 py-4 px-6 pr-8 min-w-max rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-4 pointer-events-none"
                 >
                    <div className="bg-electric-blue/20 p-3 rounded-xl text-electric-blue"><BoltIcon className="w-6 h-6" /></div>
                    <div>
                      <div className="text-xs text-slate-400 font-bold uppercase">Study Streak</div>
                      <div className="text-white font-bold text-lg">14 Days Fire 🔥</div>
                    </div>
                 </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Premium Features Bento Grid */}
      <section className="py-32 bg-slate-50 dark:bg-slate-950 relative border-t border-slate-200 dark:border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-brand-600 dark:text-brand-400 font-bold tracking-widest uppercase text-sm mb-4 font-display">Why Scholarly</h2>
            <p className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight text-slate-900 dark:text-white text-balance">
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
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 items-center justify-center relative overflow-hidden group-hover/bento:scale-[1.02] transition-transform duration-500">
                    {i === 0 && <AcademicCapIcon className="h-16 w-16 text-brand-500/50" />}
                    {i === 1 && <PlayCircleIcon className="h-16 w-16 text-electric-blue/50" />}
                    {i === 2 && <UserGroupIcon className="h-16 w-16 text-purple-500/50" />}
                    {i === 3 && <BoltIcon className="h-16 w-16 text-amber-500/50" />}
                    {i >= 4 && <StarIcon className="h-16 w-16 text-emerald-500/50" />}
                  </div>
                }
                icon={
                   <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 border border-slate-200 dark:border-white/10 group-hover/bento:bg-brand-500 group-hover/bento:text-white transition-colors duration-300">
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

      {/* Teachers Section */}
      <section className="py-32 bg-white dark:bg-slate-900 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-display text-slate-900 dark:text-white tracking-tight">Learn from <span className="text-gradient">experts.</span></h2>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium">
                Connect directly with vetted specialists dedicated to your academic success.
              </p>
            </div>
            <Link to="/teachers">
              <Button variant="outline" className="hidden md:flex items-center gap-2 rounded-xl h-12 px-6 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold group">
                Meet all teachers <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          <motion.div initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
            {highlightTeachers.map((teacher) => (
              <motion.div key={teacher._id} variants={fadeUp}>
                <GlassCard glowHover className="h-full bg-slate-50 dark:bg-slate-950 rounded-[2rem] p-8 border border-slate-200 dark:border-white/5">
                  <div className="flex justify-between items-start mb-8">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-brand-500/30 transition-all duration-500 group-hover:rotate-3">
                        <img
                          src={teacher.avatar || 'https://ui-avatars.com/api/?name=' + teacher.name}
                          alt={teacher.name}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform">
                        <CheckBadgeIcon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" className="rounded-xl font-bold bg-slate-200 dark:bg-white/10 dark:text-white" onClick={() => onMessage(teacher._id, teacher.name)}>
                      Message
                    </Button>
                  </div>

                  <h3 className="text-2xl font-black font-display text-slate-900 dark:text-white mb-1">{teacher.name}</h3>
                  <div className="text-sm text-brand-600 dark:text-electric-blue font-bold tracking-wide uppercase mb-4">Senior Lecturer</div>

                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 line-clamp-3 leading-relaxed font-medium">
                    {teacher.bio || 'Experienced educator passionate about helping students achieve their academic goals and beyond.'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {teacher.assignedSubjects?.slice(0,2).map((subject: any) => (
                       <span key={subject._id} className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                          {subject.title}
                       </span>
                    ))}
                    {teacher.assignedSubjects?.length > 2 && (
                      <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                        +{teacher.assignedSubjects.length - 2} more
                      </span>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Marquee */}
      <section className="py-32 bg-slate-950 text-white relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-brand-900/20 via-slate-950 to-slate-950" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 mb-16 text-center">
          <motion.h2 initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-black font-display mb-6 tracking-tight text-white">
            Loved by <span className="text-gradient">thousands.</span>
          </motion.h2>
        </div>

        <div className="relative w-full overflow-hidden flex flex-col gap-6">
           <div className="flex w-fit animate-marquee gap-6 hover:[animation-play-state:paused] pr-6">
              {[...testimonials, ...testimonials].map((testimonial, idx) => (
                 <GlassCard key={idx} glowHover className="w-[400px] shrink-0 bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border-white/10">
                    <div className="flex gap-1 text-amber-400 mb-6">
                       {[...Array(5)].map((_, i) => <StarIconSolid key={i} className="h-5 w-5" />)}
                    </div>
                    <p className="text-lg font-medium leading-relaxed mb-8 text-slate-300">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-4 mt-auto">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-500 to-electric-blue flex items-center justify-center font-bold text-white text-lg shadow-glow">
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-white">{testimonial.name}</div>
                        <div className="text-sm text-slate-400 font-medium">{testimonial.context}</div>
                      </div>
                    </div>
                 </GlassCard>
              ))}
           </div>
        </div>
        
        <div className="relative z-10 mt-20 text-center">
           <Button size="lg" className="h-14 px-8 text-lg font-bold bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 transition-all shadow-glow rounded-2xl" onClick={() => onOpenAuth('register', 'student')}>
             Start Your Journey
           </Button>
        </div>
      </section>
    </div>
  )
}

export default Home
