import { useEffect, useState } from 'react'
import { ArrowRightIcon, PlayCircleIcon, AcademicCapIcon, BoltIcon, CheckBadgeIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import { features, testimonials } from '../data'
import { publicApi } from '../lib/api'

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
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[600px] w-[600px] rounded-full bg-brand-100/50 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-3xl" />
          <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-purple-100/30 blur-2xl animate-bounce duration-[10s]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 space-y-8 text-center lg:text-left animate-fade-in">
              <Badge className="bg-white/80 backdrop-blur border border-brand-100 shadow-sm">
                <span className="flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                  </span>
                  New: Student & Teacher Dashboards 2.0
                </span>
              </Badge>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 text-balance">
                Master your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">exams</span> with confidence.
              </h1>

              <p className="text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-balance">
                Scholarly brings past papers, recorded lectures, quizzes, and live classes
                into one premium workspace. Built for ambitious students and expert teachers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Button size="lg" onClick={() => onOpenAuth('register', 'student')} className="shadow-xl shadow-brand-500/20 hover:shadow-brand-500/30 transition-all transform hover:-translate-y-1">
                  Start Learning Free
                </Button>
                <Link to="/courses">
                  <Button variant="outline" size="lg" className="bg-white/50 backdrop-blur hover:bg-white group">
                    Explore Courses <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-slate-500 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <CheckBadgeIcon className="h-5 w-5 text-brand-600" />
                  <span>Verified Teachers</span>
                </div>
                <div className="flex items-center gap-2">
                  <BoltIcon className="h-5 w-5 text-brand-600" />
                  <span>Instant Access</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="flex-1 w-full max-w-xl lg:max-w-none relative animate-slide-up delay-100">
              <div className="relative rounded-3xl bg-white/40 backdrop-blur-xl p-4 border border-white/50 shadow-2xl overflow-hidden glass">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />


                {/* Mockup Content */}
                <div className="rounded-2xl bg-white shadow-inner overflow-hidden relative">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="h-2 w-20 rounded-full bg-slate-100" />
                  </div>
                  <div className="p-0">
                    <div className="relative aspect-video bg-slate-900 flex items-center justify-center group cursor-pointer overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
                      <img
                        src="https://images.unsplash.com/photo-1593697821252-0c9137d9fc45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                        alt="Lecture"
                        className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white group-hover:scale-110 transition-all z-10 border border-white/30 pl-1 shadow-2xl">
                        <PlayCircleIcon className="h-10 w-10" />
                      </div>

                      {/* Player Controls Mockup */}
                      <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur rounded-lg p-3 border border-white/10 flex items-center gap-3">
                        <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full w-1/3 bg-brand-500" />
                        </div>
                        <span className="text-xs text-white font-mono">04:20</span>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex-shrink-0" />
                        <div className="space-y-2 w-full">
                          <div className="h-4 w-3/4 bg-slate-100 rounded" />
                          <div className="h-3 w-1/2 bg-slate-50 rounded" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-20 rounded-xl bg-slate-50 border border-slate-100" />
                        <div className="h-20 rounded-xl bg-slate-50 border border-slate-100" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base font-semibold text-brand-600 uppercase tracking-wide">Why Scholarly</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to excel, <br /> all in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <Card key={feature.title} className="group hover:-translate-y-2 transition-all duration-300 border-none shadow-card hover:shadow-card-hover bg-slate-50/50">
                <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-600 mb-6 group-hover:scale-110 transition-transform">
                  {idx === 0 && <AcademicCapIcon className="h-6 w-6" />}
                  {idx === 1 && <PlayCircleIcon className="h-6 w-6" />}
                  {idx === 2 && <UserGroupIcon className="h-6 w-6" />}
                  {idx === 3 && <BoltIcon className="h-6 w-6" />}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Teachers Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -ml-[600px] w-[1200px] h-full bg-white/40 skew-x-12 -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Learn from the experts</h2>
              <p className="mt-4 text-lg text-slate-600 max-w-2xl">
                Our teachers are vetted specialists dedicated to your success. Connect with them directly.
              </p>
            </div>
            <Link to="/teachers" className="text-brand-700 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
              View all teachers <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {highlightTeachers.map((teacher) => (
              <div key={teacher._id} className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all group border border-slate-100">
                <div className="flex justify-between items-start mb-6">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full overflow-hidden ring-4 ring-slate-50 group-hover:ring-brand-50 transition-all">
                      <img
                        src={teacher.avatar || 'https://ui-avatars.com/api/?name=' + teacher.name}
                        alt={teacher.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckBadgeIcon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => onMessage(teacher._id, teacher.name)}>
                    Message
                  </Button>
                </div>

                <h3 className="text-xl font-bold text-slate-900">{teacher.name}</h3>
                <div className="text-sm text-brand-600 font-medium mb-4">Senior Lecturer</div>

                <p className="text-slate-600 text-sm mb-6 line-clamp-2">
                  {teacher.bio || 'Experienced educator passionate about helping students achieve their academic goals.'}
                </p>

                <div className="flex flex-wrap gap-2">
                  {teacher.assignedSubjects?.map((subject: any) => (
                    <span key={subject._id} className="px-3 py-1 rounded-full bg-slate-50 text-xs font-semibold text-slate-600 border border-slate-200">
                      {subject.title}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="bg-white/10 text-white border-white/20 mb-6">Testimonials</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Join thousands of happy learners.</h2>
              <p className="text-slate-400 text-lg mb-8">
                From high school students to lifelong learners, Scholarly is changing the way people prepare for their future.
              </p>
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 border-none" onClick={() => onOpenAuth('register', 'student')}>
                Join the Community
              </Button>
            </div>

            <div className="grid gap-6">
              {testimonials.map((testimonial, idx) => (
                <div key={testimonial.name} className={`bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors ${idx === 1 ? 'lg:ml-12' : ''}`}>
                  <div className="flex gap-1 text-amber-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-lg font-medium leading-relaxed mb-4">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center font-bold text-white text-sm">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <div className="font-bold">{testimonial.name}</div>
                      <div className="text-xs text-slate-400">{testimonial.context}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
