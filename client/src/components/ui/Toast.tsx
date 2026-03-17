import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ICONS = {
  success: <CheckCircle size={16} className="text-green-600" />,
  error: <XCircle size={16} className="text-red-600" />,
  warning: <AlertTriangle size={16} className="text-yellow-600" />,
  info: <Info size={16} className="text-blue-600" />,
};

const STYLES = {
  success: 'border-green-200 bg-green-50',
  error: 'border-red-200 bg-red-50',
  warning: 'border-yellow-200 bg-yellow-50',
  info: 'border-blue-200 bg-blue-50',
};

export function ToastContainer() {
  const { toasts, dismiss } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-start gap-3 p-3 rounded-lg border shadow-md ${STYLES[t.type]}`}>
          <span className="mt-0.5 shrink-0">{ICONS[t.type]}</span>
          <p className="text-sm text-gray-800 flex-1">{t.message}</p>
          <button onClick={() => dismiss(t.id)} className="shrink-0 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
