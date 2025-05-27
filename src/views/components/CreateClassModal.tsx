import React, { useState } from 'react';
import { X, BookOpen, Palette } from 'lucide-react';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    background_color?: string;
  }) => void;
}

const BACKGROUND_COLORS = [
  { color: '#f3f4f6', name: '회색' },
  { color: '#fef3c7', name: '노란색' },
  { color: '#fce7f3', name: '분홍색' },
  { color: '#dbeafe', name: '파란색' },
  { color: '#d1fae5', name: '초록색' },
  { color: '#e0e7ff', name: '보라색' },
  { color: '#fed7d7', name: '빨간색' },
  { color: '#f0fff4', name: '민트색' },
];

export const CreateClassModal: React.FC<CreateClassModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    background_color: '#f3f4f6',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('수업 이름을 입력해주세요.');
      return;
    }

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      background_color: formData.background_color,
    });

    // 폼 초기화
    setFormData({
      title: '',
      description: '',
      background_color: '#f3f4f6',
    });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-2xl p-6 w-full max-w-md'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-gray-900'>새 수업 만들기</h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              수업 이름 *
            </label>
            <input
              type='text'
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder='예: 1학년 1반 과학 탐구'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              수업 설명 (선택사항)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder='수업에 대한 간단한 설명을 입력하세요'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none'
              maxLength={500}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-3'>
              <Palette className='inline mr-1' size={16} />
              배경 색상
            </label>
            <div className='grid grid-cols-4 gap-3'>
              {BACKGROUND_COLORS.map(({ color, name }) => (
                <button
                  key={color}
                  type='button'
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      background_color: color,
                    }))
                  }
                  className={`relative p-3 rounded-lg border-2 transition-all ${
                    formData.background_color === color
                      ? 'border-blue-500 ring-2 ring-blue-200 scale-105'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                  title={name}
                >
                  <div className='w-full h-6 rounded flex items-center justify-center'>
                    {formData.background_color === color && (
                      <div className='w-3 h-3 bg-blue-600 rounded-full'></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className='flex gap-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
            >
              취소
            </button>
            <button
              type='submit'
              className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              수업 만들기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
