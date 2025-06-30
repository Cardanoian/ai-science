import React from 'react';
import { X } from 'lucide-react';

interface PresentationModalProps {
  htmlContent: string;
  onClose: () => void;
}

const PresentationModal: React.FC<PresentationModalProps> = ({
  htmlContent,
  onClose,
}) => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col'>
        <div className='flex justify-between items-center p-4 border-b border-gray-200'>
          <h2 className='text-xl font-bold text-gray-800'>발표자료 미리보기</h2>
          <button
            onClick={onClose}
            className='p-2 rounded-full hover:bg-gray-100 transition-colors'
          >
            <X className='w-6 h-6 text-gray-600' />
          </button>
        </div>
        <div className='flex-1 p-4 overflow-hidden'>
          <iframe
            srcDoc={htmlContent}
            title='Presentation Preview'
            className='w-full h-full border-none rounded-md'
            sandbox='allow-scripts allow-same-origin' // 보안을 위해 sandbox 속성 추가
          />
        </div>
      </div>
    </div>
  );
};

export default PresentationModal;
