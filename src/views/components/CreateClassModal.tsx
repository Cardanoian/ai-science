// src/components/CreateClassModal.tsx
import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Palette,
  Sparkles,
  Users,
  AlertCircle,
} from 'lucide-react';
import type {
  ClassController,
  CreateClassData,
} from '../../controllers/ClassController';
import type { Board } from '../../models/types';

interface CreateClassModalProps {
  onClose: () => void;
  onSuccess: (board: Board) => void;
  classController: ClassController;
  teacherId: string;
}

const CreateClassModal: React.FC<CreateClassModalProps> = ({
  onClose,
  onSuccess,
  classController,
  teacherId,
}) => {
  const [formData, setFormData] = useState<CreateClassData>({
    title: '',
    description: '',
    background_color: '#3b82f6',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 배경색 팔레트
  const colorPalette = [
    { name: '파란색', value: '#3b82f6', preview: 'bg-blue-500' },
    { name: '보라색', value: '#8b5cf6', preview: 'bg-purple-500' },
    { name: '초록색', value: '#10b981', preview: 'bg-emerald-500' },
    { name: '주황색', value: '#f59e0b', preview: 'bg-amber-500' },
    { name: '분홍색', value: '#ec4899', preview: 'bg-pink-500' },
    { name: '청록색', value: '#06b6d4', preview: 'bg-cyan-500' },
    { name: '인디고', value: '#6366f1', preview: 'bg-indigo-500' },
    { name: '회색', value: '#6b7280', preview: 'bg-gray-500' },
  ];

  // 수업명 제안
  const titleSuggestions = [
    '과학 탐구 여행',
    '창의 실험실',
    '재미있는 과학',
    '탐구하는 교실',
    '과학 마스터',
    '실험과 발견',
    '호기심 연구소',
    '과학의 세계',
  ];

  // 입력값 변경 핸들러
  const handleInputChange = (field: keyof CreateClassData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '수업명을 입력해주세요.';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = '수업명은 2자 이상이어야 합니다.';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = '수업명은 100자 이하여야 합니다.';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = '수업 설명은 500자 이하여야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 수업 생성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const newClass = await classController.createClass(teacherId, {
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
      });

      if (newClass) {
        onSuccess(newClass);
      }
    } catch (error) {
      console.error('Failed to create class:', error);
      setErrors({ general: '수업 생성 중 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 제안된 제목 선택
  const handleTitleSuggestion = (title: string) => {
    handleInputChange('title', title);
  };

  // 색상 선택된 것의 이름 찾기
  const getSelectedColorName = () => {
    const selected = colorPalette.find(
      (color) => color.value === formData.background_color
    );
    return selected ? selected.name : '사용자 정의';
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        {/* 헤더 */}
        <div className='p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center'>
                <BookOpen className='w-6 h-6 text-white' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900'>
                  새 수업 만들기
                </h2>
                <p className='text-gray-600 mt-1'>
                  학생들과 함께할 탐구 수업을 만들어보세요
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-white'
            >
              <X className='w-6 h-6' />
            </button>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* 일반 에러 메시지 */}
          {errors.general && (
            <div className='flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg'>
              <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0' />
              <p className='text-red-700 text-sm'>{errors.general}</p>
            </div>
          )}

          {/* 수업명 */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              수업명 <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <BookOpen className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='예: 5학년 과학 탐구'
                maxLength={100}
              />
            </div>
            {errors.title && (
              <p className='text-red-500 text-sm mt-1'>{errors.title}</p>
            )}

            {/* 제목 제안 */}
            <div className='mt-3'>
              <p className='text-xs text-gray-500 mb-2 flex items-center space-x-1'>
                <Sparkles className='w-3 h-3' />
                <span>제목 제안:</span>
              </p>
              <div className='flex flex-wrap gap-2'>
                {titleSuggestions.slice(0, 4).map((suggestion) => (
                  <button
                    key={suggestion}
                    type='button'
                    onClick={() => handleTitleSuggestion(suggestion)}
                    className='px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors border border-blue-200'
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 수업 설명 */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              수업 설명{' '}
              <span className='text-gray-400 text-xs'>(선택사항)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='수업에 대한 간단한 설명을 입력하세요&#10;예: 초등학교 5학년을 대상으로 한 과학 탐구 수업입니다.'
              rows={3}
              maxLength={500}
            />
            {errors.description && (
              <p className='text-red-500 text-sm mt-1'>{errors.description}</p>
            )}
            <div className='flex items-center justify-between mt-1'>
              <p className='text-xs text-gray-500'>
                {(formData.description || '').length}/500자
              </p>
              {(formData.description || '').length > 400 && (
                <p className='text-xs text-amber-600'>
                  {500 - (formData.description || '').length}자 남음
                </p>
              )}
            </div>
          </div>

          {/* 배경색 선택 */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-3'>
              <div className='flex items-center space-x-2'>
                <Palette className='w-4 h-4' />
                <span>테마 색상</span>
                <span className='text-xs text-gray-500'>
                  ({getSelectedColorName()})
                </span>
              </div>
            </label>

            {/* 미리보기 */}
            <div className='mb-4 p-4 rounded-lg border-2 border-gray-200 bg-gray-50'>
              <p className='text-sm text-gray-600 mb-2'>
                수업판 배경 미리보기:
              </p>
              <div
                className='h-20 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center text-white font-medium'
                style={{
                  backgroundColor: formData.background_color,
                  backgroundImage: `linear-gradient(135deg, ${formData.background_color}ee, ${formData.background_color}bb)`,
                }}
              >
                {formData.title || '수업 제목'}
              </div>
            </div>

            {/* 색상 팔레트 */}
            <div className='grid grid-cols-4 gap-3'>
              {colorPalette.map((color) => (
                <button
                  key={color.value}
                  type='button'
                  onClick={() =>
                    handleInputChange('background_color', color.value)
                  }
                  className={`relative h-14 rounded-xl transition-all hover:scale-105 ${
                    color.preview
                  } ${
                    formData.background_color === color.value
                      ? 'ring-4 ring-blue-500 ring-opacity-50 scale-105'
                      : 'hover:ring-2 hover:ring-gray-300'
                  }`}
                  title={color.name}
                >
                  {formData.background_color === color.value && (
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg'>
                        <span className='text-lg'>✓</span>
                      </div>
                    </div>
                  )}
                  <div className='absolute bottom-1 left-1/2 transform -translate-x-1/2'>
                    <span className='text-xs text-white font-medium bg-black bg-opacity-50 px-2 py-1 rounded'>
                      {color.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 수업 정보 안내 */}
          <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200'>
            <div className='flex items-start space-x-3'>
              <Sparkles className='w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5' />
              <div className='text-sm text-blue-800'>
                <p className='font-medium mb-2'>
                  수업 생성 후 자동으로 제공되는 기능:
                </p>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-xs'>
                  <div className='flex items-center space-x-2'>
                    <Users className='w-3 h-3' />
                    <span>6자리 수업 코드 자동 생성</span>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <BookOpen className='w-3 h-3' />
                    <span>실시간 협업 보드</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Sparkles className='w-3 h-3' />
                    <span>AI 기반 탐구 학습 지원</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className='flex space-x-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium'
            >
              취소
            </button>
            <button
              type='submit'
              disabled={isLoading || !formData.title.trim()}
              className='flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
            >
              {isLoading ? (
                <div className='flex items-center justify-center space-x-2'>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  <span>생성 중...</span>
                </div>
              ) : (
                <div className='flex items-center justify-center space-x-2'>
                  <BookOpen className='w-4 h-4' />
                  <span>수업 만들기</span>
                </div>
              )}
            </button>
          </div>

          {/* 추가 도움말 */}
          <div className='text-center pt-2'>
            <p className='text-xs text-gray-500'>
              수업을 만든 후 학생들에게 수업 코드를 공유하여 참여하도록
              안내하세요
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassModal;
