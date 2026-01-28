import { useEffect, useState } from 'react'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import { useAuth } from '../contexts/AuthContext'
import { quizApi, publicApi, studentApi } from '../lib/api'
import { VideoCameraIcon, PlayCircleIcon, DocumentTextIcon, ArrowDownTrayIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import VideoModal from '../components/VideoModal'

const Quizzes = () => {
  const { subscriptionStatus } = useAuth()
  const [quizzes, setQuizzes] = useState<
    Array<{
      _id: string
      title: string
      subjectId: { _id: string; title: string }
      questions: Array<{ question: string; options: string[] }>
      isPremium: boolean
    }>
  >([])
  const [documents, setDocuments] = useState<
    Array<{
      _id: string
      title: string
      year?: string
      format?: string
      type: string
      size?: string
      url: string
      isPremium?: boolean
    }>
  >([])
  const [videos, setVideos] = useState<
    Array<{
      _id: string
      title: string
      type: string
      url: string
      isPremium?: boolean
    }>
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [quizResult, setQuizResult] = useState<{ score: number; totalQuestions: number; correctAnswers: number } | null>(
    null,
  )
  const [aiPrompt, setAiPrompt] = useState('Build a 10-question quiz on integrals with mixed difficulty.')

  const [aiStatus, setAiStatus] = useState<string | null>(null)

  const [playingVideo, setPlayingVideo] = useState<{ url: string; title: string; type: string } | null>(null)

  const hasSubscription = subscriptionStatus?.isActive ?? false

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [quizzesData, resourcesData] = await Promise.all([
        quizApi.getAll(),
        publicApi.getResources()
      ])
      setQuizzes(quizzesData)

      const docs = resourcesData.filter(r => ['doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'].includes(r.type) || r.type === 'pdf')
      const vids = resourcesData.filter(r => ['video', 'mp4', 'mkv', 'avi', 'mov', 'link'].includes(r.type) || r.type === 'video')

      setDocuments(docs)
      setVideos(vids)
    } catch (error: any) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartQuiz = async (quizId: string) => {
    setSelectedQuiz(quizId)
    setQuizAnswers({})
    setQuizResult(null)
  }

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz) return
    const quiz = quizzes.find(q => q._id === selectedQuiz)
    if (!quiz) return

    // Construct answers array matching question indices
    const answers = quiz.questions.map((_, idx) => quizAnswers[idx] ?? -1)

    // Check if at least one question is answered (ignoring -1)
    if (answers.every(a => a === -1)) {
      alert('Please answer at least one question.')
      return
    }

    try {
      const result = await studentApi.attemptQuiz(selectedQuiz, answers)
      setQuizResult(result)
      alert(`Quiz completed! Score: ${result.correctAnswers}/${result.totalQuestions} (${result.score}%)`)
    } catch (error: any) {
      alert(`Failed to submit quiz: ${error.message}`)
    }
  }

  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace('/api', '')

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge>Resources</Badge>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Downloads & Quizzes</h1>
          <p className="text-slate-600">
            Access study materials, watch videos, and take quizzes.
          </p>
        </div>
        <div className="text-sm font-semibold text-brand-700">
          {hasSubscription ? 'Subscription active' : 'Free access'}
        </div>
      </div>



      {/* Documents Section Split */}
      <div className="space-y-8">
        {/* Free Documents */}
        <div>
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Free Documents</h2>
          </div>
          {documents.filter(d => !d.isPremium).length === 0 ? (
            <p className="text-slate-500 italic">No free documents available.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {documents.filter(d => !d.isPremium).map((paper) => (
                <Card key={paper._id} className="card-hover flex flex-col justify-between h-full">
                  <div className="flex items-start justify-between mb-2">
                    <Badge color="blue">{paper.year || 'DOC'}</Badge>
                    <span className="text-xs font-bold uppercase text-slate-400">{paper.format || paper.type}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{paper.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">Size: {paper.size || 'N/A'}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <a
                      href={paper.url.startsWith('http') ? paper.url : `${baseUrl}${paper.url}`}
                      download={!paper.url.startsWith('http')}
                      target="_blank"
                      rel="noreferrer"
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

        {/* Premium Documents */}
        <div>
          <div className="flex items-center gap-3 border-b border-amber-200 pb-4 mb-4">
            <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Premium Documents</h2>
            <Badge color="amber">Subscription Required</Badge>
          </div>
          {documents.filter(d => d.isPremium).length === 0 ? (
            <p className="text-slate-500 italic">No premium documents available.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {documents.filter(d => d.isPremium).map((paper) => (
                <Card key={paper._id} className="card-hover flex flex-col justify-between h-full border-amber-100">
                  <div className="flex items-start justify-between mb-2">
                    <Badge color="amber">PREMIUM</Badge>
                    <span className="text-xs font-bold uppercase text-slate-400">{paper.format || paper.type}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{paper.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">Size: {paper.size || 'N/A'}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    {hasSubscription ? (
                      <a
                        href={paper.url.startsWith('http') ? paper.url : `${baseUrl}${paper.url}`}
                        download={!paper.url.startsWith('http')}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full rounded-lg bg-amber-100 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-200 transition-colors"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Download Premium
                      </a>
                    ) : (
                      <button
                        disabled
                        className="flex items-center justify-center gap-2 w-full rounded-lg bg-slate-100 py-2.5 text-sm font-medium text-slate-400 cursor-not-allowed"
                      >
                        Locked (Subscribe to Access)
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Videos Section */}
      {/* Videos Section Split */}
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-4">
            <div className="bg-red-100 p-2 rounded-lg text-red-600">
              <VideoCameraIcon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Free Videos</h2>
          </div>
          {videos.filter(v => !v.isPremium).length === 0 ? (
            <p className="text-slate-500 italic">No free videos available.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videos.filter(v => !v.isPremium).map((video: any) => (
                <Card key={video._id} padding="p-0" className="card-hover flex flex-col justify-between h-full overflow-hidden group border-0 shadow-md">
                  {/* Thumbnail Area */}
                  <div className="aspect-video bg-slate-900 relative">
                    {video.thumbnail ? (
                      <img src={video.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={video.title} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700">
                        <VideoCameraIcon className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => setPlayingVideo(video)}
                        className="bg-white/20 text-white p-4 rounded-full backdrop-blur-sm hover:scale-110 transition-transform hover:bg-brand-600/90"
                      >
                        <PlayCircleIcon className="h-10 w-10" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 leading-tight">{video.title}</h3>
                    <div className="text-xs text-slate-500 mt-2 uppercase font-medium flex items-center gap-2">
                      <span className="bg-slate-100 px-2 py-1 rounded">{video.type === 'link' ? 'Stream' : 'File'}</span>
                      <span>{new Date(video.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-3 border-b border-amber-200 pb-4 mb-4">
            <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
              <VideoCameraIcon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Premium Videos</h2>
            <Badge color="amber">Subscription Required</Badge>
          </div>
          {videos.filter(v => v.isPremium).length === 0 ? (
            <p className="text-slate-500 italic">No premium videos available.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videos.filter(v => v.isPremium).map((video) => (
                <Card key={video._id} className="card-hover flex flex-col justify-between h-full border-amber-100">
                  <div className="aspect-video bg-slate-900 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden group">
                    <PlayCircleIcon className="h-12 w-12 text-amber-200 group-hover:text-amber-400 transition-colors" />
                    <div className="absolute top-2 right-2">
                      <Badge color="amber">PREMIUM</Badge>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{video.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 uppercase font-medium">{video.type === 'link' ? 'Stream' : 'Video File'}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    {hasSubscription ? (
                      <a
                        href={video.url.startsWith('http') ? video.url : `${baseUrl}${video.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full rounded-lg bg-amber-100 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-200 transition-colors"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        Watch Premium
                      </a>
                    ) : (
                      <button
                        disabled
                        className="flex items-center justify-center gap-2 w-full rounded-lg bg-slate-100 py-2.5 text-sm font-medium text-slate-400 cursor-not-allowed"
                      >
                        Locked (Subscribe)
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-bold text-slate-900">Quizzes</h2>
        </div>
        {isLoading ? (
          <div className="text-slate-600">Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <Card className="bg-slate-50">
            <p className="text-slate-600">No quizzes available yet.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Card key={quiz._id} className="card-hover space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <Badge color="slate">{quiz.isPremium ? 'Premium' : 'Free'}</Badge>
                  <span>{quiz.questions.length} questions</span>
                </div>
                <div className="text-lg font-semibold text-slate-900">{quiz.title}</div>
                <div className="text-sm text-slate-600">{quiz.subjectId.title}</div>
                <Button variant="ghost" className="text-xs" onClick={() => handleStartQuiz(quiz._id)}>
                  Begin
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedQuiz && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-500">Quiz Session</div>
              <div className="text-lg font-semibold text-slate-900">
                {quizzes.find((q) => q._id === selectedQuiz)?.title}
              </div>
            </div>
            <Button variant="ghost" className="text-xs" onClick={() => setSelectedQuiz(null)}>
              Close
            </Button>
          </div>
          {quizResult ? (
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-lg font-semibold text-slate-900">
                Quiz Complete! Score: {quizResult.correctAnswers}/{quizResult.totalQuestions} ({quizResult.score}%)
              </div>
              <Button className="mt-2" onClick={() => setSelectedQuiz(null)}>
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-3 rounded-xl bg-slate-50 p-4">
              {quizzes
                .find((q) => q._id === selectedQuiz)
                ?.questions.map((q, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="text-sm font-semibold text-slate-900">
                      Q{idx + 1}. {q.question}
                    </div>
                    <div className="space-y-2 text-sm text-slate-700">
                      {q.options.map((option, optIdx) => (
                        <label
                          key={optIdx}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm hover:border-brand-200"
                        >
                          <input
                            type="radio"
                            name={`quiz-${selectedQuiz}-q${idx}`}
                            checked={quizAnswers[idx] === optIdx}
                            onChange={() => setQuizAnswers({ ...quizAnswers, [idx]: optIdx })}
                            className="text-brand-600"
                          />{' '}
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Progress: {Object.keys(quizAnswers).length} /{' '}
                  {quizzes.find((q) => q._id === selectedQuiz)?.questions.length}
                </span>
                <Button variant="secondary" className="text-xs" onClick={handleSubmitQuiz}>
                  Submit quiz
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-500">AI assistant</div>
            <div className="text-lg font-semibold text-slate-900">Generate or check quizzes with AI oversight</div>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          Share a topic or upload details and the AI will draft questions or review answers before you publish them.
        </p>
        <textarea
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          rows={3}
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {['Generate 5 MCQs on photosynthesis', 'Check answers for calculus set', 'Create mixed quiz for WWII causes'].map(
            (preset) => (
              <Button key={preset} variant="ghost" className="text-xs" onClick={() => setAiPrompt(preset)}>
                {preset}
              </Button>
            ),
          )}
        </div>
        <div className="flex items-center justify-between">
          <Button
            onClick={async () => {
              if (!aiPrompt.trim()) return
              setAiStatus('AI is drafting a quiz outline...')
              try {
                const newQuiz = await studentApi.generateQuiz(aiPrompt)
                setQuizzes([newQuiz, ...quizzes] as any)
                setAiStatus('Quiz generated! Starting now...')
                setTimeout(() => {
                  handleStartQuiz(newQuiz._id)
                  setAiStatus(null)
                }, 1500)
              } catch (e: any) {
                setAiStatus('Failed: ' + e.message)
              }
            }}
          >
            Ask AI
          </Button>
          {aiStatus && <span className="text-xs text-brand-700">{aiStatus}</span>}
        </div>
      </Card>
      {/* Video Modal */}
      {playingVideo && (
        <VideoModal
          isOpen={!!playingVideo}
          onClose={() => setPlayingVideo(null)}
          url={playingVideo.url}
          title={playingVideo.title}
          type={playingVideo.type as any}
        />
      )}
    </div>
  )
}

export default Quizzes
