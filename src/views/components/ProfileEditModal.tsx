import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import type {
  AuthController,
  UserProfile,
} from '../../controllers/AuthController';

interface ProfileEditModalProps {
  onClose: () => void;
  onSuccess: (updatedProfile: UserProfile) => void;
  authController: AuthController;
  currentProfile: UserProfile;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  onClose,
  onSuccess,
  authController,
  currentProfile,
}) => {
  const [displayName, setDisplayName] = useState(
    currentProfile.display_name || ''
  );
  const [school, setSchool] = useState(currentProfile.school || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDisplayName(currentProfile.display_name || '');
    setSchool(currentProfile.school || '');
  }, [currentProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfile.id) {
      toast.error('사용자 ID를 찾을 수 없습니다.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedProfile = await authController.updateUserProfile(
        currentProfile.id,
        {
          display_name: displayName,
          school: school,
        }
      );
      onSuccess(updatedProfile);
      onClose();
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      // AuthController에서 이미 toast 메시지를 처리하므로 여기서는 추가하지 않습니다.
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors'
        >
          <X className='w-5 h-5' />
        </button>
        <h2 className='text-2xl font-bold text-gray-800 mb-6'>프로필 편집</h2>

        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label
              htmlFor='displayName'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              닉네임
            </label>
            <input
              type='text'
              id='displayName'
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              placeholder='닉네임을 입력하세요'
              required
            />
          </div>

          <div className='mb-6'>
            <label
              htmlFor='school'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              소속 학교 (선택 사항)
            </label>
            <input
              type='text'
              id='school'
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              placeholder='소속 학교를 입력하세요'
            />
          </div>

          <div className='flex justify-end space-x-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors'
              disabled={isSaving}
            >
              취소
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={isSaving}
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
