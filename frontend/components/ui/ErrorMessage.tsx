import { AlertCircleIcon } from './Icons';

interface ErrorMessageProps {
  title?: string;
  message: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export function ErrorMessage({
  title = 'Error',
  message,
  showRetry = false,
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="flex justify-center mb-3">
        <AlertCircleIcon className="text-red-600" size={48} />
      </div>
      <h3 className="text-lg font-semibold text-red-900 mb-2">{title}</h3>
      <p className="text-red-700 mb-4">{message}</p>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

interface ApiConnectionErrorProps {
  onRetry?: () => void;
}

export function ApiConnectionError({ onRetry }: ApiConnectionErrorProps) {
  return (
    <ErrorMessage
      title="Unable to Connect to API"
      message="The backend API is not responding. Please ensure the backend server is running at http://localhost:5000"
      showRetry={!!onRetry}
      onRetry={onRetry}
    />
  );
}
