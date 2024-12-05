import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

const ProcessingStates = ({ isProcessing, error, processingMessage = "Processing your request..." }) => {
  if (isProcessing) {
    return (
      <div className="flex items-center justify-center space-x-2 text-blue-600 my-4">
        <Loader2 className="animate-spin" size={20} />
        <span className="text-sm">{processingMessage}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg my-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2" />
          <div>
            <h3 className="font-medium">Error</h3>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-sm underline hover:no-underline mt-2"
            >
              Try refreshing the page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ProcessingStates;