import React from 'react';

interface GenerateReportButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  label?: string;
}

const GenerateReportButton: React.FC<GenerateReportButtonProps> = ({
  onClick,
  isLoading = false,
  label = 'Generate Report',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`px-4 py-2 rounded-lg shadow ${isLoading
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-[#A17E25] hover:bg-[#8C6A1A] text-white'
        }`}
    >
      {isLoading ? (
        <span className="flex items-center">
          <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
          Generating...
        </span>
      ) : (
        label
      )}
    </button>
  );
};

export default GenerateReportButton;