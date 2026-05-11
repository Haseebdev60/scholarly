import Badge from '../components/Badge'
import { GlassCard } from '../components/GlassCard'
import { motion, useScroll, useTransform } from 'framer-motion'
import { fadeUp, staggerContainer, scaleIn } from '../lib/utils'
import { useRef } from 'react'

const values = [
  { title: 'Clarity', body: 'We turn complex topics into digestible, visual journeys that make sense.', icon: 'M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z', color: 'from-blue-500 to-cyan-500' },
  { title: 'Support', body: 'Teachers and students share one seamless space to communicate and plan.', icon: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z', color: 'from-purple-500 to-pink-500' },
  { title: 'Progress', body: 'Track your growth with intelligent quizzes, detailed notes, and clear milestones.', icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z', color: 'from-amber-400 to-orange-500' },
]

const timeline = [
  { year: '2021', title: 'The Spark', description: 'Scholarly began as a simple idea to help a few students organize their past papers.' },
  { year: '2022', title: 'First Prototype', description: 'We launched the beta version, gaining our first 100 passionate users.' },
  { year: '2023', title: 'Going Premium', description: 'Introduced premium courses, video streaming, and verified instructors.' },
  { year: '2024', title: 'Global Reach', description: 'Now serving over 10,000 active students and teachers globally with cutting-edge tools.' },
]

const team = [
  { name: 'Amelia Rhodes', role: 'Founder & CEO', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80', bio: 'Former school director building technology that teachers actually love to use.' },
  { name: 'Dr. Ray Kim', role: 'Academic Lead', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80', bio: 'Designs our core curriculum templates and rigorous assessment frameworks.' },
  { name: 'Priya Desai', role: 'Head of Community', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80', bio: 'Oversees teacher onboarding, quality control, and parent communications.' },
]

const About = () => {
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 300])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden relative">
      {/* Dynamic Backgrounds */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] left-0 w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section ref={targetRef} className="relative pt-32 pb-40 lg:pt-48 lg:pb-48">
        <motion.div 
          style={{ y, opacity }}
          initial="initial"
          animate="animate"
          variants={fadeUp}
          className="mx-auto max-w-5xl text-center px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <Badge className="mb-8 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border-none px-4 py-1.5 font-bold uppercase tracking-widest text-xs inline-flex">Our Story</Badge>
          <h1 className="text-6xl md:text-8xl font-black font-display text-slate-900 dark:text-white tracking-tighter leading-[1.05] mb-8">
            We make learning <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-electric-blue to-purple-500 animate-pulse-slow">calmer</span> & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-brand-500">sharper</span>.
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mx-auto font-medium">
            Scholarly is an education platform built for modern schools, dedicated tutors, and highly motivated students. We bring clarity to the chaos of learning.
          </p>
        </motion.div>
      </section>

      {/* Mission/Vision Grid */}
      <section className="py-24 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-8 md:grid-cols-3"
          >
            {values.map((item, idx) => (
              <motion.div key={idx} variants={fadeUp} className="h-full">
                 <GlassCard glowHover className="h-full space-y-8 p-10 bg-white/60 dark:bg-slate-900/60 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 backdrop-blur-xl group relative overflow-hidden">
                   <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
                   
                   <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-glow relative z-10 group-hover:scale-110 transition-transform duration-500`}>
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                       <path strokeLinecap="round" strokeLinejoin="round" d={item.icon.split(' ')[0]} />
                       {item.icon.split(' ')[1] && <path strokeLinecap="round" strokeLinejoin="round" d={item.icon.split(' ')[1]} />}
                     </svg>
                   </div>
                   
                   <div className="relative z-10">
                     <div className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">{item.title}</div>
                     <div className="text-2xl md:text-3xl font-black font-display text-slate-900 dark:text-white leading-tight">
                       {item.body}
                     </div>
                   </div>
                 </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-32 relative z-10 border-y border-slate-200/50 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-display text-slate-900 dark:text-white tracking-tight mb-6">Our <span className="text-gradient">Journey</span></h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">See how we've grown from a simple idea to a comprehensive platform.</p>
          </motion.div>

          <motion.div 
            initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="max-w-5xl mx-auto relative border-l-2 border-brand-200 dark:border-brand-900/50 ml-6 md:mx-auto"
          >
             {timeline.map((item, idx) => (
               <motion.div variants={fadeUp} key={item.year} className="relative pl-10 md:pl-0 mb-16 last:mb-0 group">
                  <div className="md:w-1/2 md:pr-16 md:text-right md:ml-0 md:absolute md:left-0 md:top-0">
                     <div className="text-4xl font-black font-display text-brand-600 dark:text-brand-400 hidden md:block opacity-50 group-hover:opacity-100 transition-opacity">{item.year}</div>
                  </div>
                  <div className="absolute left-[-9px] md:left-[50%] md:-ml-[9px] top-2 h-4 w-4 rounded-full bg-gradient-to-r from-brand-500 to-electric-blue ring-4 ring-white dark:ring-slate-950 group-hover:scale-150 group-hover:shadow-glow transition-all duration-300"></div>
                  <div className="md:w-1/2 md:pl-16 md:ml-auto">
                     <div className="text-3xl font-black font-display text-brand-600 dark:text-brand-400 mb-4 md:hidden">{item.year}</div>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-electric-blue transition-colors">{item.title}</h3>
                     <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
               </motion.div>
             ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
             initial="initial"
             whileInView="animate"
             viewport={{ once: true, margin: "-100px" }}
             variants={fadeUp}
             className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-display text-slate-900 dark:text-white tracking-tight mb-6">Leadership <span className="text-gradient">Team</span></h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
              Built by educators, for educators. We understand the classroom because we've been there.
            </p>
          </motion.div>

          <motion.div initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid gap-12 md:grid-cols-3 max-w-6xl mx-auto">
            {team.map((member) => (
              <motion.div variants={fadeUp} key={member.name}>
                <GlassCard glowHover className="overflow-hidden bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/5 rounded-[2.5rem] backdrop-blur-xl group">
                  <div className="aspect-[4/5] w-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent z-10" />
                    <img src={member.img} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale-[0.3] group-hover:grayscale-0" />
                    <div className="absolute bottom-0 left-0 w-full p-8 z-20">
                      <div className="text-sm font-bold text-brand-400 uppercase tracking-widest mb-2">{member.role}</div>
                      <div className="text-3xl font-black font-display text-white mb-3">{member.name}</div>
                    </div>
                  </div>
                  <div className="p-8 bg-slate-900">
                    <p className="text-slate-400 text-base leading-relaxed font-medium">
                      {member.bio}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default About
