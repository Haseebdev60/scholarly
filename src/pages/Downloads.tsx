import { useEffect, useState } from 'react'
import { publicApi } from '../lib/api'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { DocumentTextIcon, PlayCircleIcon, ArrowDownTrayIcon, FilmIcon } from '@heroicons/react/24/outline'

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

    if (loading) return <div className="p-20 text-center text-slate-500">Loading resources...</div>

    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace('/api', '')

    return (
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 lg:px-8">
            <div className="mb-10 text-center">
                <Badge>Resources</Badge>
                <h1 className="mt-3 text-3xl font-bold text-slate-900">Downloads & Materials</h1>
                <p className="mt-2 text-slate-600">Access study documents and watch educational videos.</p>
            </div>

            <div className="space-y-12">
                {/* Documents Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <DocumentTextIcon className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Documents</h2>
                    </div>

                    {documents.length === 0 ? (
                        <div className="text-center text-slate-500 py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            No documents available.
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {documents.map(doc => (
                                <Card key={doc._id} className="flex flex-col justify-between h-full hover:shadow-lg transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                                            <DocumentTextIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 line-clamp-2">{doc.title}</h3>
                                            <p className="text-xs text-slate-500 mt-1 uppercase font-medium">{doc.type} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <a
                                            href={doc.url.startsWith('http') ? doc.url : `${baseUrl}${doc.url}`}
                                            download={!doc.url.startsWith('http')}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full rounded-lg bg-slate-100 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                                        >
                                            <ArrowDownTrayIcon className="h-4 w-4" />
                                            Download
                                        </a>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Videos Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                        <div className="bg-red-100 p-2 rounded-lg text-red-600">
                            <FilmIcon className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Video Resources</h2>
                    </div>

                    {videos.length === 0 ? (
                        <div className="text-center text-slate-500 py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            No videos available.
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {videos.map(video => (
                                <Card key={video._id} className="flex flex-col justify-between h-full hover:shadow-lg transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-red-50 p-3 rounded-lg text-red-600">
                                            <PlayCircleIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 line-clamp-2">{video.title}</h3>
                                            <p className="text-xs text-slate-500 mt-1 uppercase font-medium">{video.type} • {new Date(video.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <a
                                            href={video.url.startsWith('http') ? video.url : `${baseUrl}${video.url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full rounded-lg bg-brand-50 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-100 transition-colors"
                                        >
                                            <PlayCircleIcon className="h-4 w-4" />
                                            {video.type === 'link' ? 'Watch Now' : 'Download Video'}
                                        </a>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Downloads
