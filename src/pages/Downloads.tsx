import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { publicApi } from '../lib/api'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { fadeUp, staggerContainer, scaleIn } from '../lib/utils'
import { DocumentTextIcon, PlayCircleIcon, ArrowDownTrayIcon, FilmIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline'

type Resource = {
    _id: string
    title: string
    type: string
    url: string
    fileType?: string
    createdAt: string
}

const Downloads = () => {
    const [resources, setResources] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        publicApi.getDownloads()
            .then(setResources)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const documents = resources.filter(r => ['doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'].includes(r.type) || r.type === 'pdf')
    const videos = resources.filter(r => ['video', 'mp4', 'mkv', 'avi', 'mov', 'link'].includes(r.type) || r.type === 'video')

    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace('/api', '')

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* App Showcase Hero Section */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden relative">
               {/* Abstract background elements */}
               <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
               <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

               <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12">
                   <motion.div 
                     initial="initial" animate="animate" variants={fadeUp} 
                     className="w-full lg:w-1/2 space-y-8 text-center lg:text-left"
                   >
                       <Badge color="slate">Mobile App Coming Soon</Badge>
                       <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                           Learning, now in your pocket.
                       </h1>
                       <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0">
                           The Scholarly mobile app is currently in development. Soon you'll be able to access your courses, download materials for offline viewing, and message teachers on the go.
                       </p>
                       <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                           <Button disabled className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 opacity-70 cursor-not-allowed">
                              <svg viewBox="0 0 384 512" className="h-5 w-5 fill-current"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                              <div className="text-left leading-tight">
                                 <div className="text-[10px] uppercase font-semibold opacity-80">Coming Soon</div>
                                 <div className="text-sm font-bold">App Store</div>
                              </div>
                           </Button>
                           <Button disabled className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-8 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 border-none text-white shadow-button opacity-70 cursor-not-allowed">
                              <svg viewBox="0 0 512 512" className="h-5 w-5 fill-current"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
                              <div className="text-left leading-tight">
                                 <div className="text-[10px] uppercase font-semibold opacity-80">Coming Soon</div>
                                 <div className="text-sm font-bold">Google Play</div>
                              </div>
                           </Button>
                       </div>
                   </motion.div>

                   <motion.div 
                     initial="initial" animate="animate" variants={scaleIn} 
                     className="w-full lg:w-1/2 relative flex justify-center"
                   >
                      <div className="relative w-64 h-[500px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden shadow-brand-500/20">
                         {/* Mockup screen */}
                         <div className="absolute inset-0 bg-white dark:bg-slate-950 flex flex-col">
                            <div className="h-20 bg-brand-600 w-full rounded-b-[2rem]"></div>
                            <div className="p-4 space-y-4">
                               <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                               <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                               <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                            </div>
                         </div>
                         {/* Mockup Notch */}
                         <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 rounded-b-2xl w-32 mx-auto"></div>
                      </div>
                   </motion.div>
               </div>
            </div>

            {/* Resources Section */}
            <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Web Resources & Downloads</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">Access study documents and watch educational videos directly from the browser.</p>
                </div>

                {loading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />)}
                    </div>
                ) : (
                    <div className="space-y-16">
                        {/* Documents Section */}
                        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer} className="space-y-8">
                            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                                <div className="bg-blue-100 dark:bg-blue-900/20 p-2.5 rounded-xl text-blue-600 dark:text-blue-400">
                                    <DocumentTextIcon className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Documents</h3>
                            </div>

                            {documents.length === 0 ? (
                                <div className="text-center text-slate-500 dark:text-slate-400 py-12 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                                    No documents available.
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {documents.map(doc => (
                                        <motion.div key={doc._id} variants={fadeUp}>
                                           <Card className="flex flex-col justify-between h-full hover:shadow-card-hover transition-all bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                                               <div className="flex items-start gap-4">
                                                   <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                                                       <DocumentTextIcon className="h-6 w-6" />
                                                   </div>
                                                   <div>
                                                       <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-2">{doc.title}</h4>
                                                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-medium">{doc.type} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                                                   </div>
                                               </div>
                                               <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                   <a
                                                       href={doc.url.startsWith('http') ? doc.url : `${baseUrl}${doc.url}`}
                                                       download={!doc.url.startsWith('http')}
                                                       target="_blank"
                                                       rel="noopener noreferrer"
                                                       className="flex items-center justify-center gap-2 w-full rounded-xl bg-slate-100 dark:bg-slate-800 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                   >
                                                       <ArrowDownTrayIcon className="h-4 w-4" />
                                                       Download File
                                                   </a>
                                               </div>
                                           </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Videos Section */}
                        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer} className="space-y-8">
                            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                                <div className="bg-red-100 dark:bg-red-900/20 p-2.5 rounded-xl text-red-600 dark:text-red-400">
                                    <FilmIcon className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Video Resources</h3>
                            </div>

                            {videos.length === 0 ? (
                                <div className="text-center text-slate-500 dark:text-slate-400 py-12 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                                    No videos available.
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {videos.map(video => (
                                        <motion.div key={video._id} variants={fadeUp}>
                                           <Card className="flex flex-col justify-between h-full hover:shadow-card-hover transition-all bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                                               <div className="flex items-start gap-4">
                                                   <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl text-red-600 dark:text-red-400 shrink-0">
                                                       <PlayCircleIcon className="h-6 w-6" />
                                                   </div>
                                                   <div>
                                                       <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-2">{video.title}</h4>
                                                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-medium">{video.type} • {new Date(video.createdAt).toLocaleDateString()}</p>
                                                   </div>
                                               </div>
                                               <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                   <a
                                                       href={video.url.startsWith('http') ? video.url : `${baseUrl}${video.url}`}
                                                       target="_blank"
                                                       rel="noopener noreferrer"
                                                       className="flex items-center justify-center gap-2 w-full rounded-xl bg-brand-50 dark:bg-brand-900/20 py-2.5 text-sm font-semibold text-brand-700 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
                                                   >
                                                       <PlayCircleIcon className="h-4 w-4" />
                                                       {video.type === 'link' ? 'Watch Online' : 'Download Video'}
                                                   </a>
                                               </div>
                                           </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Downloads
