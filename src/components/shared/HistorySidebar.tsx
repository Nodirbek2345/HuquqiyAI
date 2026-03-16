import React from 'react';
import { AnalysisResult, RiskLevel } from '../../types';
import { Clock, FileText, ChevronRight, X, AlertTriangle, ShieldCheck, LogIn } from 'lucide-react';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: AnalysisResult[];
  onSelectHistory: (result: AnalysisResult) => void;
  currentResultId?: string;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  currentResultId
}) => {
  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('uz-UZ', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return isoString;
    }
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.HIGH: return 'text-red-600 bg-red-50 border-red-100';
      case RiskLevel.MEDIUM: return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-green-600 bg-green-50 border-green-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Sidebar Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">

          {/* Left: Admin Login Button */}


          {/* Center: Title */}
          <div className="flex items-center gap-2 text-gray-900 font-bold text-lg absolute left-1/2 -translate-x-1/2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="hidden sm:inline">Tarix</span>
          </div>

          {/* Right: Close Button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Hozircha tarix bo'sh</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectHistory(item)}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md group relative
                  ${currentResultId === item.id
                    ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRiskColor(item.overallRisk)}`}>
                      {item.overallRisk === RiskLevel.HIGH ? 'YUQORI XAVF' :
                        item.overallRisk === RiskLevel.MEDIUM ? "O'RTA XAVF" : "PAST XAVF"}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                </div>

                <h4 className="font-semibold text-gray-800 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
                  {item.documentType || 'Noma\'lum hujjat'}
                </h4>

                {item.fileName && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                    <FileText className="w-3 h-3" />
                    {item.fileName}
                  </p>
                )}

                <div className="flex items-center justify-between mt-3 text-xs text-gray-500 border-t border-gray-100 pt-2">
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      {item.totalIssuesCount} muammo
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-blue-500" />
                      {item.riskScore}/100 ball
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorySidebar;