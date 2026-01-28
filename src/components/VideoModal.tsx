import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

type Props = {
    isOpen: boolean
    onClose: () => void
    url: string
    title: string
    type: 'video' | 'link'
}

export default function VideoModal({ isOpen, onClose, url, title, type }: Props) {
    const getEmbedUrl = (rawUrl: string) => {
        // Handle YouTube
        const ytMatch = rawUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)
        if (ytMatch && ytMatch[2].length === 11) {
            return `https://www.youtube.com/embed/${ytMatch[2]}?autoplay=1`
        }
        return rawUrl // Fallback or direct link
    }

    const isVideoFile = type === 'video' || url.startsWith('/uploads')

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/90" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-black p-1 shadow-2xl transition-all">
                                <div className="relative aspect-video w-full bg-black">
                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-white/20"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>

                                    {isVideoFile ? (
                                        <video
                                            src={url}
                                            controls
                                            autoPlay
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <iframe
                                            src={getEmbedUrl(url)}
                                            className="w-full h-full border-0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    )}
                                </div>
                                <div className="p-4 bg-slate-900 text-left">
                                    <h3 className="text-lg font-bold text-white">{title}</h3>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
