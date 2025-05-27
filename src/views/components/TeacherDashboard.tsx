// src/views/components/TeacherDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Users,
  Copy,
  Share,
  Settings,
  LogOut,
  BookOpen,
  Eye,
  Trash2,
} from 'lucide-react';
import { ClassController, ClassInfo } from '../../controllers/ClassController';
import { AuthController, UserProfile } from '../../controllers/AuthController';
import { CreateClassModal } from './CreateClassModal';
import { ClassDetailModal } from './ClassDetailModal';

interface TeacherDashboardProps {
  user: any;
  onSelectClass: (classInfo: ClassInfo) => void;
  onLogout: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  user,
  onSelectClass,
  onLogout,
}) => {
  const [classController] = useState(() => new ClassController());
  const [authController] = useState(() => new AuthController());

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);

  useEffect(() => {
    loadUserProfile();
    loadClasses();
  }, [user]);

  const loadUserProfile = async () => {
    if (user) {
      const profile = await authController.getUserProfile(user.id);
      setUserProfile(profile);
    }
  };

  const loadClasses = async () => {
    if (user) {
      setLoading(true);
      const myClasses = await classController.getMyClasses(user.id);
      setClasses(myClasses);
      setLoading(false);
    }
  };

  const handleCreateClass = async (classData: {
    title: string;
    description?: string;
    background_color?: string;
  }) => {
    const newClass = await classController.createClass(user.id, classData);
    if (newClass) {
      setClasses((prev) => [newClass, ...prev]);
      setShowCreateModal(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (
      window.confirm(
        '정말로 이 수업을 삭제하시겠습니까?\n삭제된 수업은 복구할 수 없습니다.'
      )
    ) {
      const success = await classController.deleteClass(classId);
      if (success) {
        setClasses((prev) => prev.filter((c) => c.id !== classId));
      }
    }
  };

  const handleClassDetail = (classInfo: ClassInfo) => {
    setSelectedClass(classInfo);
    setShowDetailModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* 헤더 */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <BookOpen className='text-blue-600' size={28} />
                <h1 className='text-2xl font-bold text-gray-900'>
                  과학 탐구 여행
                </h1>
              </div>
              <span className='text-gray-500'>|</span>
              <span className='text-gray-600'>교사 대시보드</span>
            </div>

            <div className='flex items-center gap-4'>
              <div className='text-right'>
                <p className='font-medium text-gray-900'>
                  {userProfile?.display_name || user.email}
                </p>
                <p className='text-sm text-gray-500'>
                  {userProfile?.school || '교사'}
                </p>
              </div>

              <button
                onClick={onLogout}
                className='flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <LogOut size={16} />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className='max-w-7xl mx-auto px-4 py-8'>
        {/* 상단 섹션 */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h2 className='text-3xl font-bold text-gray-900 mb-2'>내 수업</h2>
            <p className='text-gray-600'>
              수업을 만들고 학생들과 함께 과학 탐구를 시작해보세요
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all'
          >
            <Plus size={20} />새 수업 만들기
          </button>
        </div>

        {/* 수업 목록 */}
        {classes.length === 0 ? (
          <div className='text-center py-16'>
            <BookOpen size={64} className='mx-auto text-gray-400 mb-4' />
            <h3 className='text-xl font-medium text-gray-900 mb-2'>
              아직 수업이 없습니다
            </h3>
            <p className='text-gray-600 mb-6'>
              첫 번째 수업을 만들어 학생들과 탐구를 시작해보세요
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className='inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              <Plus size={20} />
              수업 만들기
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {classes.map((classInfo) => (
              <div
                key={classInfo.id}
                className='bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden group'
              >
                {/* 클래스 썸네일 */}
                <div
                  className='h-32 relative'
                  style={{ backgroundColor: classInfo.background_color }}
                >
                  <div className='absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center'>
                    <BookOpen size={32} className='text-white opacity-80' />
                  </div>

                  {/* 액션 버튼들 */}
                  <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1'>
                    <button
                      onClick={() => handleClassDetail(classInfo)}
                      className='p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg transition-colors'
                      title='수업 상세보기'
                    >
                      <Eye size={16} className='text-gray-700' />
                    </button>
                    <button
                      onClick={() =>
                        classController.copyClassCode(classInfo.class_code)
                      }
                      className='p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg transition-colors'
                      title='수업 코드 복사'
                    >
                      <Copy size={16} className='text-gray-700' />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(classInfo.id)}
                      className='p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg transition-colors'
                      title='수업 삭제'
                    >
                      <Trash2 size={16} className='text-red-600' />
                    </button>
                  </div>
                </div>

                {/* 클래스 정보 */}
                <div className='p-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2 line-clamp-2'>
                    {classInfo.title}
                  </h3>

                  {classInfo.description && (
                    <p className='text-gray-600 text-sm mb-3 line-clamp-2'>
                      {classInfo.description}
                    </p>
                  )}

                  {/* 수업 코드 */}
                  <div className='bg-gray-50 rounded-lg p-3 mb-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-xs text-gray-500 font-medium'>
                          수업 코드
                        </p>
                        <p className='text-xl font-mono font-bold text-gray-900 tracking-widest'>
                          {classInfo.class_code}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          classController.copyClassCode(classInfo.class_code)
                        }
                        className='p-2 hover:bg-gray-200 rounded-lg transition-colors'
                        title='복사'
                      >
                        <Copy size={16} className='text-gray-600' />
                      </button>
                    </div>
                  </div>

                  {/* 생성일 */}
                  <p className='text-xs text-gray-500 mb-4'>
                    생성일: {formatDate(classInfo.created_at)}
                  </p>

                  {/* 액션 버튼 */}
                  <div className='flex gap-2'>
                    <button
                      onClick={() => onSelectClass(classInfo)}
                      className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
                    >
                      수업 입장
                    </button>
                    <button
                      onClick={() =>
                        classController.copyShareUrl(classInfo.class_code)
                      }
                      className='p-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors'
                      title='공유 링크 복사'
                    >
                      <Share size={16} className='text-gray-600' />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 모달들 */}
      <CreateClassModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateClass}
      />

      {selectedClass && (
        <ClassDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedClass(null);
          }}
          classInfo={selectedClass}
          onEnterClass={() => onSelectClass(selectedClass)}
        />
      )}
    </div>
  );
};
