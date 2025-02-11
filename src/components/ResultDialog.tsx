import { useRef, useState } from 'react';

interface ResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'completed' | 'failed';
  finalAnswer: string | null;
}

export default function ResultDialog({ isOpen, onClose, status, finalAnswer }: ResultDialogProps) {
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const copyToClipboard = async () => {
    if (finalAnswer) {
      try {
        await navigator.clipboard.writeText(finalAnswer);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={`fixed inset-0 z-50 w-full h-full bg-black/30 backdrop-blur-[2px] p-3 sm:p-6 md:p-8 overflow-y-auto ${
        isOpen ? 'flex items-center justify-center' : 'hidden'
      }`}
      open={isOpen}
    >
      <div className={`w-full max-w-3xl transform rounded-xl sm:rounded-2xl shadow-2xl ${
        status === 'completed' ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
      }`}>
        {/* Header */}
        <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b ${
          status === 'completed' ? 'border-green-200' : 'border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-1.5 sm:p-2 rounded-full ${
                status === 'completed' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {status === 'completed' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <h3 className={`text-base sm:text-xl font-normal ${
                status === 'completed' ? 'text-green-700' : 'text-red-700'
              }`}>
                {status === 'completed' ? 'Task Completed Successfully' : 'Task Failed'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors ${
                status === 'completed' ? 'text-green-700' : 'text-red-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${
            status === 'completed' ? 'bg-green-100/50' : 'bg-red-100/50'
          }`}>
            <p className={`text-sm sm:text-base leading-relaxed font-normal break-words whitespace-pre-wrap ${
              status === 'completed' ? 'text-green-700' : 'text-red-700'
            }`}>
              {finalAnswer?.includes("401 Incorrect API key provided: sk-proj-") 
                ? "Unexpected error occurred. Please try again later."
                : finalAnswer}
            </p>
          </div>
          
          {status === 'completed' && (
            <div className="mt-3 sm:mt-4 flex justify-end">
              <button
                onClick={copyToClipboard}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-thin
                  ${copied 
                    ? 'bg-green-200 text-green-800' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                  } transition-colors`}
              >
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
} 