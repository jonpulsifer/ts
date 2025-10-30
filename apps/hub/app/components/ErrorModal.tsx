import { AlertCircle, X } from 'lucide-react';

interface ErrorModalProps {
  error: string;
  onClose: () => void;
}

export function ErrorModal({ error, onClose }: ErrorModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border-2 border-red-500 rounded-lg p-6 max-w-lg w-full shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <h2 className="text-xl font-bold text-white">Configuration Error</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-gray-300 mb-4 whitespace-pre-line">{error}</div>
        <div className="bg-gray-900 rounded p-3 mb-4">
          <div className="text-sm font-mono text-gray-400 mb-2">
            Required environment variables:
          </div>
          <div className="space-y-1 text-xs font-mono text-gray-300">
            <div>TEMPESTWX_TOKENS (Secret, required)</div>
            <div className="text-xs text-gray-500 mt-1">Comma-separated list of tokens</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

