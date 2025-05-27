import React, { useState } from 'react';
import { X, Hash, User } from 'lucide-react';
import { ClassController } from '../../controllers/ClassController';

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinSuccess: (classCode: string, studentName?: string) => void;
}

export const JoinClassModal: React.FC<JoinClassModalProps> = ({
  isOpen,
  onClose,
  onJoinSuccess,
}) => {
  const [classController] = useState(() => new ClassController());
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    classCode: '',
    studentName: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(), // 수업 코드는 대문자로
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.classCode || formData.classCode.length !== 6) {
      alert('6자리 수업 코드를 정확히 입력해주세요.');
      return;
    }

    if (!formData.studentName.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const classInfo = await classController.joinClassByCode(
        formData.classCode,
        formData.studentName.trim()
      );

      if (classInfo) {
        onJoinSuccess(formData.classCode, formData.studentName.trim());
        onClose();
      }
    } catch (error) {
      console.error('Join class error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatClassCode = (value: string) => {
    // 숫자만 허용하고 6자리로 제한
    const digits = value.replace(/\D/g, '').slice(0, 6);
    return digits;
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-2xl p-6 w-full max-w-md'>
        {/* 헤더 */}
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-gray-900'>수업 참여하기</h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        {/* 안내 메시지 */}
        <div className='bg-blue-50 p-4 rounded-lg mb-6'>
          <p className='text-blue-800 text-sm'>
            선생님이 알려준 6자리 수업 코드를 입력하면 바로 수업에 참여할 수
            있어요!
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* 수업 코드 */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              수업 코드
            </label>
            <div className='relative'>
              <Hash
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                size={16}
              />
              <input
                type='text'
                name='classCode'
                value={formData.classCode}
                onChange={(e) => {
                  const formatted = formatClassCode(e.target.value);
                  setFormData((prev) => ({ ...prev, classCode: formatted }));
                }}
                placeholder='123456'
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-center text-2xl font-mono tracking-widest'
                maxLength={6}
                pattern='[0-9]{6}'
                required
              />
            </div>
            <p className='text-xs text-gray-500 mt-1'>
              선생님이 알려준 6자리 숫자를 입력하세요
            </p>
          </div>

          {/* 학생 이름 */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              이름
            </label>
            <div className='relative'>
              <User
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                size={16}
              />
              <input
                type='text'
                name='studentName'
                value={formData.studentName}
                onChange={handleInputChange}
                placeholder='김학생'
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500'
                required
              />
            </div>
          </div>

          {/* 제출 버튼 */}
          <button
            type='submit'
            disabled={loading || formData.classCode.length !== 6}
            className='w-full py-3 bg-gradient-to-r from-pink-600 to-orange-600 text-white rounded-lg font-semibold hover:from-pink-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
          >
            {loading ? '참여 중...' : '수업 참여하기'}
          </button>
        </form>

        {/* 도움말 */}
        <div className='mt-6 text-center'>
          <p className='text-gray-500 text-sm'>
            수업 코드를 모르시나요? 선생님께 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  );
};
