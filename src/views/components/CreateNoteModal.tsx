import React, { useState, useEffect } from 'react';
import { colorPalette } from '../../constants/colorPalette';

interface CreateNoteModalProps {
  show: boolean;
  initialColor: string;
  onCancel: () => void;
  onConfirm: (content: string, color: string) => void;
}

const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  show,
  initialColor,
  onCancel,
  onConfirm,
}) => {
  const [content, setContent] = useState('');
  const [color, setColor] = useState(initialColor);

  useEffect(() => {
    if (show) {
      setContent('');
      setColor(initialColor);
    }
  }, [show, initialColor]);

  if (!show) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-lg shadow-lg w-96 p-6'>
        <h2 className='text-lg font-semibold mb-4'>새 노트 생성</h2>
        <input
          type='text'
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder='노트 제목'
          className='w-full mb-4 p-2 border rounded'
        />
        <p className='text-xs text-gray-500 mb-2'>색상 선택</p>
        <div className='grid grid-cols-4 gap-2 mb-4'>
          {colorPalette.map((c) => (
            <button
              key={c.value}
              onClick={() => setColor(c.value)}
              className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                color === c.value
                  ? 'border-gray-800 scale-110'
                  : 'border-gray-300'
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
        <div className='flex justify-end space-x-2'>
          <button onClick={onCancel} className='px-4 py-2 bg-gray-200 rounded'>
            취소
          </button>
          <button
            onClick={() => onConfirm(content || '새 탐구', color)}
            className='px-4 py-2 bg-blue-500 text-white rounded'
          >
            만들기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateNoteModal;
