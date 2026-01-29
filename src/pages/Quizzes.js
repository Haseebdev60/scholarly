import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { quizApi, publicApi, studentApi } from '../lib/api';
import { VideoCameraIcon, PlayCircleIcon, DocumentTextIcon, ArrowDownTrayIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import VideoModal from '../components/VideoModal';
const Quizzes = () => {
    const { subscriptionStatus } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [aiPrompt, setAiPrompt] = useState('Build a 10-question quiz on integrals with mixed difficulty.');
    const [aiStatus, setAiStatus] = useState(null);
    const [playingVideo, setPlayingVideo] = useState(null);
    const hasSubscription = subscriptionStatus?.isActive ?? false;
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            const [quizzesData, resourcesData] = await Promise.all([
                quizApi.getAll(),
                publicApi.getResources()
            ]);
            setQuizzes(quizzesData);
            const docs = resourcesData.filter(r => ['doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'].includes(r.type) || r.type === 'pdf');
            const vids = resourcesData.filter(r => ['video', 'mp4', 'mkv', 'avi', 'mov', 'link'].includes(r.type) || r.type === 'video');
            setDocuments(docs);
            setVideos(vids);
        }
        catch (error) {
            console.error('Failed to load data:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleStartQuiz = async (quizId) => {
        setSelectedQuiz(quizId);
        setQuizAnswers({});
        setQuizResult(null);
    };
    const handleSubmitQuiz = async () => {
        if (!selectedQuiz)
            return;
        const quiz = quizzes.find(q => q._id === selectedQuiz);
        if (!quiz)
            return;
        // Construct answers array matching question indices
        const answers = quiz.questions.map((_, idx) => quizAnswers[idx] ?? -1);
        // Check if at least one question is answered (ignoring -1)
        if (answers.every(a => a === -1)) {
            alert('Please answer at least one question.');
            return;
        }
        try {
            const result = await studentApi.attemptQuiz(selectedQuiz, answers);
            setQuizResult(result);
            alert(`Quiz completed! Score: ${result.correctAnswers}/${result.totalQuestions} (${result.score}%)`);
        }
        catch (error) {
            alert(`Failed to submit quiz: ${error.message}`);
        }
    };
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace('/api', '');
    return (_jsxs("div", { className: "mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "flex flex-col gap-2 md:flex-row md:items-center md:justify-between", children: [_jsxs("div", { children: [_jsx(Badge, { children: "Resources" }), _jsx("h1", { className: "mt-2 text-3xl font-bold text-slate-900", children: "Downloads & Quizzes" }), _jsx("p", { className: "text-slate-600", children: "Access study materials, watch videos, and take quizzes." })] }), _jsx("div", { className: "text-sm font-semibold text-brand-700", children: hasSubscription ? 'Subscription active' : 'Free access' })] }), _jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3 border-b border-slate-200 pb-4 mb-4", children: [_jsx("div", { className: "bg-blue-100 p-2 rounded-lg text-blue-600", children: _jsx(DocumentTextIcon, { className: "h-6 w-6" }) }), _jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Free Documents" })] }), documents.filter(d => !d.isPremium).length === 0 ? (_jsx("p", { className: "text-slate-500 italic", children: "No free documents available." })) : (_jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: documents.filter(d => !d.isPremium).map((paper) => (_jsxs(Card, { className: "card-hover flex flex-col justify-between h-full", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsx(Badge, { color: "blue", children: paper.year || 'DOC' }), _jsx("span", { className: "text-xs font-bold uppercase text-slate-400", children: paper.format || paper.type })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 line-clamp-2", children: paper.title }), _jsxs("p", { className: "text-xs text-slate-500 mt-1", children: ["Size: ", paper.size || 'N/A'] })] }), _jsx("div", { className: "mt-4 pt-4 border-t border-slate-50", children: _jsxs("a", { href: paper.url.startsWith('http') ? paper.url : `${baseUrl}${paper.url}`, download: !paper.url.startsWith('http'), target: "_blank", rel: "noreferrer", className: "flex items-center justify-center gap-2 w-full rounded-lg bg-slate-100 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors", children: [_jsx(ArrowDownTrayIcon, { className: "h-4 w-4" }), "Download"] }) })] }, paper._id))) }))] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3 border-b border-amber-200 pb-4 mb-4", children: [_jsx("div", { className: "bg-amber-100 p-2 rounded-lg text-amber-600", children: _jsx(DocumentTextIcon, { className: "h-6 w-6" }) }), _jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Premium Documents" }), _jsx(Badge, { color: "amber", children: "Subscription Required" })] }), documents.filter(d => d.isPremium).length === 0 ? (_jsx("p", { className: "text-slate-500 italic", children: "No premium documents available." })) : (_jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: documents.filter(d => d.isPremium).map((paper) => (_jsxs(Card, { className: "card-hover flex flex-col justify-between h-full border-amber-100", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsx(Badge, { color: "amber", children: "PREMIUM" }), _jsx("span", { className: "text-xs font-bold uppercase text-slate-400", children: paper.format || paper.type })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 line-clamp-2", children: paper.title }), _jsxs("p", { className: "text-xs text-slate-500 mt-1", children: ["Size: ", paper.size || 'N/A'] })] }), _jsx("div", { className: "mt-4 pt-4 border-t border-slate-50", children: hasSubscription ? (_jsxs("a", { href: paper.url.startsWith('http') ? paper.url : `${baseUrl}${paper.url}`, download: !paper.url.startsWith('http'), target: "_blank", rel: "noreferrer", className: "flex items-center justify-center gap-2 w-full rounded-lg bg-amber-100 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-200 transition-colors", children: [_jsx(ArrowDownTrayIcon, { className: "h-4 w-4" }), "Download Premium"] })) : (_jsx("button", { disabled: true, className: "flex items-center justify-center gap-2 w-full rounded-lg bg-slate-100 py-2.5 text-sm font-medium text-slate-400 cursor-not-allowed", children: "Locked (Subscribe to Access)" })) })] }, paper._id))) }))] })] }), _jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3 border-b border-slate-200 pb-4 mb-4", children: [_jsx("div", { className: "bg-red-100 p-2 rounded-lg text-red-600", children: _jsx(VideoCameraIcon, { className: "h-6 w-6" }) }), _jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Free Videos" })] }), videos.filter(v => !v.isPremium).length === 0 ? (_jsx("p", { className: "text-slate-500 italic", children: "No free videos available." })) : (_jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: videos.filter(v => !v.isPremium).map((video) => (_jsxs(Card, { padding: "p-0", className: "card-hover flex flex-col justify-between h-full overflow-hidden group border-0 shadow-md", children: [_jsxs("div", { className: "aspect-video bg-slate-900 relative", children: [video.thumbnail ? (_jsx("img", { src: video.thumbnail, className: "w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity", alt: video.title })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center text-slate-700", children: _jsx(VideoCameraIcon, { className: "w-12 h-12" }) })), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("button", { onClick: () => setPlayingVideo(video), className: "bg-white/20 text-white p-4 rounded-full backdrop-blur-sm hover:scale-110 transition-transform hover:bg-brand-600/90", children: _jsx(PlayCircleIcon, { className: "h-10 w-10" }) }) })] }), _jsxs("div", { className: "p-4 flex flex-col flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 line-clamp-2 leading-tight", children: video.title }), _jsxs("div", { className: "text-xs text-slate-500 mt-2 uppercase font-medium flex items-center gap-2", children: [_jsx("span", { className: "bg-slate-100 px-2 py-1 rounded", children: video.type === 'link' ? 'Stream' : 'File' }), _jsx("span", { children: new Date(video.createdAt || Date.now()).toLocaleDateString() })] })] })] }, video._id))) }))] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3 border-b border-amber-200 pb-4 mb-4", children: [_jsx("div", { className: "bg-amber-100 p-2 rounded-lg text-amber-600", children: _jsx(VideoCameraIcon, { className: "h-6 w-6" }) }), _jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Premium Videos" }), _jsx(Badge, { color: "amber", children: "Subscription Required" })] }), videos.filter(v => v.isPremium).length === 0 ? (_jsx("p", { className: "text-slate-500 italic", children: "No premium videos available." })) : (_jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: videos.filter(v => v.isPremium).map((video) => (_jsxs(Card, { className: "card-hover flex flex-col justify-between h-full border-amber-100", children: [_jsxs("div", { className: "aspect-video bg-slate-900 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden group", children: [_jsx(PlayCircleIcon, { className: "h-12 w-12 text-amber-200 group-hover:text-amber-400 transition-colors" }), _jsx("div", { className: "absolute top-2 right-2", children: _jsx(Badge, { color: "amber", children: "PREMIUM" }) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 line-clamp-2", children: video.title }), _jsx("p", { className: "text-xs text-slate-500 mt-1 uppercase font-medium", children: video.type === 'link' ? 'Stream' : 'Video File' })] }), _jsx("div", { className: "mt-4 pt-4 border-t border-slate-50", children: hasSubscription ? (_jsxs("a", { href: video.url.startsWith('http') ? video.url : `${baseUrl}${video.url}`, target: "_blank", rel: "noopener noreferrer", className: "flex items-center justify-center gap-2 w-full rounded-lg bg-amber-100 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-200 transition-colors", children: [_jsx(ArrowTopRightOnSquareIcon, { className: "h-4 w-4" }), "Watch Premium"] })) : (_jsx("button", { disabled: true, className: "flex items-center justify-center gap-2 w-full rounded-lg bg-slate-100 py-2.5 text-sm font-medium text-slate-400 cursor-not-allowed", children: "Locked (Subscribe)" })) })] }, video._id))) }))] })] }), _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between border-b border-slate-200 pb-4", children: _jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Quizzes" }) }), isLoading ? (_jsx("div", { className: "text-slate-600", children: "Loading quizzes..." })) : quizzes.length === 0 ? (_jsx(Card, { className: "bg-slate-50", children: _jsx("p", { className: "text-slate-600", children: "No quizzes available yet." }) })) : (_jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: quizzes.map((quiz) => (_jsxs(Card, { className: "card-hover space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-slate-500", children: [_jsx(Badge, { color: "slate", children: quiz.isPremium ? 'Premium' : 'Free' }), _jsxs("span", { children: [quiz.questions.length, " questions"] })] }), _jsx("div", { className: "text-lg font-semibold text-slate-900", children: quiz.title }), _jsx("div", { className: "text-sm text-slate-600", children: quiz.subjectId.title }), _jsx(Button, { variant: "ghost", className: "text-xs", onClick: () => handleStartQuiz(quiz._id), children: "Begin" })] }, quiz._id))) }))] }), selectedQuiz && (_jsxs(Card, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold text-slate-500", children: "Quiz Session" }), _jsx("div", { className: "text-lg font-semibold text-slate-900", children: quizzes.find((q) => q._id === selectedQuiz)?.title })] }), _jsx(Button, { variant: "ghost", className: "text-xs", onClick: () => setSelectedQuiz(null), children: "Close" })] }), quizResult ? (_jsxs("div", { className: "rounded-xl bg-slate-50 p-4", children: [_jsxs("div", { className: "text-lg font-semibold text-slate-900", children: ["Quiz Complete! Score: ", quizResult.correctAnswers, "/", quizResult.totalQuestions, " (", quizResult.score, "%)"] }), _jsx(Button, { className: "mt-2", onClick: () => setSelectedQuiz(null), children: "Close" })] })) : (_jsxs("div", { className: "space-y-3 rounded-xl bg-slate-50 p-4", children: [quizzes
                                .find((q) => q._id === selectedQuiz)
                                ?.questions.map((q, idx) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "text-sm font-semibold text-slate-900", children: ["Q", idx + 1, ". ", q.question] }), _jsx("div", { className: "space-y-2 text-sm text-slate-700", children: q.options.map((option, optIdx) => (_jsxs("label", { className: "flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm hover:border-brand-200", children: [_jsx("input", { type: "radio", name: `quiz-${selectedQuiz}-q${idx}`, checked: quizAnswers[idx] === optIdx, onChange: () => setQuizAnswers({ ...quizAnswers, [idx]: optIdx }), className: "text-brand-600" }), ' ', option] }, optIdx))) })] }, idx))), _jsxs("div", { className: "flex items-center justify-between text-xs text-slate-500", children: [_jsxs("span", { children: ["Progress: ", Object.keys(quizAnswers).length, " /", ' ', quizzes.find((q) => q._id === selectedQuiz)?.questions.length] }), _jsx(Button, { variant: "secondary", className: "text-xs", onClick: handleSubmitQuiz, children: "Submit quiz" })] })] }))] })), _jsxs(Card, { className: "space-y-3", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold text-slate-500", children: "AI assistant" }), _jsx("div", { className: "text-lg font-semibold text-slate-900", children: "Generate or check quizzes with AI oversight" })] }) }), _jsx("p", { className: "text-sm text-slate-600", children: "Share a topic or upload details and the AI will draft questions or review answers before you publish them." }), _jsx("textarea", { className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100", rows: 3, value: aiPrompt, onChange: (e) => setAiPrompt(e.target.value) }), _jsx("div", { className: "flex flex-wrap gap-2", children: ['Generate 5 MCQs on photosynthesis', 'Check answers for calculus set', 'Create mixed quiz for WWII causes'].map((preset) => (_jsx(Button, { variant: "ghost", className: "text-xs", onClick: () => setAiPrompt(preset), children: preset }, preset))) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Button, { onClick: async () => {
                                    if (!aiPrompt.trim())
                                        return;
                                    setAiStatus('AI is drafting a quiz outline...');
                                    try {
                                        const newQuiz = await studentApi.generateQuiz(aiPrompt);
                                        setQuizzes([newQuiz, ...quizzes]);
                                        setAiStatus('Quiz generated! Starting now...');
                                        setTimeout(() => {
                                            handleStartQuiz(newQuiz._id);
                                            setAiStatus(null);
                                        }, 1500);
                                    }
                                    catch (e) {
                                        setAiStatus('Failed: ' + e.message);
                                    }
                                }, children: "Ask AI" }), aiStatus && _jsx("span", { className: "text-xs text-brand-700", children: aiStatus })] })] }), playingVideo && (_jsx(VideoModal, { isOpen: !!playingVideo, onClose: () => setPlayingVideo(null), url: playingVideo.url, title: playingVideo.title, type: playingVideo.type }))] }));
};
export default Quizzes;
