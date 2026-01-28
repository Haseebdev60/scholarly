
import Modal from './Modal'
import Button from './Button'
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

export type AlertDialogProps = {
    open: boolean
    onClose: () => void
    title: string
    message: string
    type: 'success' | 'error' | 'info' | 'confirm'
    onConfirm?: () => void
}

const AlertDialog = ({ open, onClose, title, message, type, onConfirm }: AlertDialogProps) => {
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon className="h-12 w-12 text-green-500" />
            case 'error':
                return <ExclamationCircleIcon className="h-12 w-12 text-red-500" />
            case 'confirm':
                return <ExclamationCircleIcon className="h-12 w-12 text-amber-500" />
            default:
                return <InformationCircleIcon className="h-12 w-12 text-blue-500" />
        }
    }

    return (
        <Modal open={open} onClose={onClose} title="">
            <div className="text-center">
                <div className="flex justify-center mb-4">
                    {getIcon()}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-600 mb-6">{message}</p>

                <div className="flex justify-center gap-3">
                    {type === 'confirm' ? (
                        <>
                            <Button variant="secondary" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button onClick={() => {
                                if (onConfirm) onConfirm()
                                onClose()
                            }}>
                                Confirm
                            </Button>
                        </>
                    ) : (
                        <Button onClick={onClose} className="min-w-[100px]">
                            OK
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    )
}

export default AlertDialog
