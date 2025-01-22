interface CompareResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: {
    orderId: string;
    analysisDate: string;
    newGrants: string[];
  }[];
  currentAnalysisDate: string;
}

export default function CompareResultsModal({ isOpen, onClose, results, currentAnalysisDate }: CompareResultsModalProps) {
  if (!isOpen) return null;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Võrdluse tulemused</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            Praegune analüüs: <span className="font-medium">{formatDateTime(currentAnalysisDate)}</span>
          </p>
        </div>
        
        {results.length === 0 ? (
          <p className="text-gray-600">Varasemaid analüüse ei leitud.</p>
        ) : (
          <div className="space-y-6">
            {results.map((result, index) => (
              <div key={result.orderId} className="border-b pb-4 last:border-b-0">
                <p className="text-sm text-gray-500 mb-2">
                  Eelmine analüüs: <span className="font-medium">{formatDateTime(result.analysisDate)}</span>
                </p>
                {result.newGrants.length === 0 ? (
                  <p className="text-gray-600">Uusi toetusi ei lisandunud.</p>
                ) : (
                  <>
                    <p className="font-medium mb-2">Lisandunud toetused:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {result.newGrants.map((grant, i) => (
                        <li key={i} className="text-gray-700">{grant}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 