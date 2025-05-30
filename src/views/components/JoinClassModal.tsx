// src/components/JoinClassModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Users, BookOpen, ArrowRight, AlertCircle } from 'lucide-react';
import type { ClassController } from '../../controllers/ClassController';
import type { Board } from '../../models/types';

interface JoinClassModalProps {
  onClose: () => void;
  onSuccess: (board: Board) => void;
  classController: ClassController;
}

const JoinClassModal: React.FC<JoinClassModalProps> = ({
  onClose,
  onSuccess,
  classController,
}) => {
  const [classCode, setClassCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [foundClass, setFoundClass] = useState<Board | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  // URL에서 수업 코드 추출
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode) {
      setClassCode(joinCode);
      handleSearchClass(joinCode);
    }
  }, []);

  // 수업 코드 입력 처리
  const handleCodeChange = (value: string) => {
    // 숫자만 입력 허용, 6자리 제한
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setClassCode(numericValue);
    setError('');
    setFoundClass(null);

    // 6자리가 입력되면 자동 검색
    if (numericValue.length === 6) {
      handleSearchClass(numericValue);
    }
  };

  // 수업 검색
  const handleSearchClass = async (code: string) => {
    if (code.length !== 6) return;

    try {
      setIsSearching(true);
      setError('');

      const classData = await classController.getClassByCode(code);

      if (classData) {
        setFoundClass(classData);
      } else {
        setError('해당 수업 코드를 찾을 수 없습니다.');
        setFoundClass(null);
      }
    } catch (error) {
      console.error('Failed to search class:', error);
      setError('수업을 찾는 중 오류가 발생했습니다.');
      setFoundClass(null);
    } finally {
      setIsSearching(false);
    }
  };

  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!foundClass) {
      if (classCode.length === 6) {
        handleSearchClass(classCode);
      } else {
        setError('6자리 수업 코드를 입력해주세요.');
      }
      return;
    }

    if (!studentName.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    // DB 등록 없이 바로 성공 처리
    onSuccess(foundClass!);
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md'>
        {/* 헤더 */}
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>수업 참여</h2>
              <p className='text-gray-600 mt-1'>
                수업 코드를 입력하여 참여하세요
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
            >
              <X className='w-6 h-6' />
            </button>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* 수업 코드 입력 */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              수업 코드
            </label>
            <div className='relative'>
              <input
                type='text'
                value={classCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                className='w-full px-4 py-3 text-center text-2xl font-mono font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors tracking-widest'
                placeholder='000000'
                maxLength={6}
              />
              {isSearching && (
                <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                  <div className='w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                </div>
              )}
            </div>
            <p className='text-xs text-gray-500 mt-1'>
              교사가 제공한 6자리 숫자 코드를 입력하세요
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className='flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg'>
              <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0' />
              <p className='text-red-700 text-sm'>{error}</p>
            </div>
          )}

          {/* 찾은 수업 정보 */}
          {foundClass && (
            <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
              <div className='flex items-start space-x-3'>
                <div className='w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <BookOpen className='w-6 h-6 text-white' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-blue-900'>
                    {foundClass.title}
                  </h3>
                  {foundClass.description && (
                    <p className='text-blue-700 text-sm mt-1'>
                      {foundClass.description}
                    </p>
                  )}
                  <div className='flex items-center space-x-4 mt-2 text-xs text-blue-600'>
                    <span>코드: {foundClass.class_code}</span>
                    <span>•</span>
                    <span>활성 상태</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 이름 입력 */}
          {foundClass && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                이름
              </label>
              <div className='relative'>
                <Users className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <input
                  type='text'
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                  placeholder='이름을 입력하세요'
                  maxLength={50}
                />
              </div>
              <p className='text-xs text-gray-500 mt-1'>
                수업에서 표시될 이름입니다
              </p>
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type='submit'
            disabled={isSearching || (!!foundClass && !studentName.trim())}
            className='w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2'
          >
            {isSearching ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                <span>수업 찾는 중...</span>
              </>
            ) : foundClass ? (
              <>
                <span>수업 참여하기</span>
                <ArrowRight className='w-4 h-4' />
              </>
            ) : (
              <span>수업 찾기</span>
            )}
          </button>

          {/* 도움말 */}
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h4 className='font-medium text-gray-900 mb-2'>
              수업 코드를 받는 방법
            </h4>
            <ul className='text-sm text-gray-600 space-y-1'>
              <li>• 담당 교사에게 6자리 수업 코드를 요청하세요</li>

              <li>• 수업 코드는 숫자로만 구성되어 있습니다</li>
            </ul>
          </div>
        </form>

        {/* 푸터 */}
        <div className='px-6 py-4 bg-gray-50 rounded-b-2xl'>
          <p className='text-center text-xs text-gray-500'>
            수업 참여에 문제가 있다면 담당 교사에게 문의하세요
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinClassModal;
