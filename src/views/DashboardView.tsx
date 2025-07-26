import React, { useState, useEffect } from 'react';
import {
  Plus,
  Users,
  BookOpen,
  LogOut,
  Search,
  Filter,
  Calendar,
  Clock,
  Copy,
  Share2,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import type { AppController } from '../controllers/AppController';
import type { AuthState } from '../controllers/AuthController';
import type { Board } from '../models/types';
import type { ClassController } from '../controllers/ClassController';
import CreateClassModal from './components/CreateClassModal';
import ProfileEditModal from './components/ProfileEditModal';

interface DashboardViewProps {
  appController: AppController;
  authState: AuthState;
  onNavigate: {
    toWelcome: () => void;
    toBoard: (board: Board) => void;
  };
}

const DashboardView: React.FC<DashboardViewProps> = ({
  appController,
  authState,
  onNavigate,
}) => {
  const [classes, setClasses] = useState<Board[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false); // 프로필 편집 모달 상태 추가
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  // const [stats, setStats] = useState({
  //   totalClasses: 0,
  //   activeProjects: 0,
  //   completedProjects: 0,
  // });

  // 수업 목록 로드
  useEffect(() => {
    const loadClasses = async () => {
      if (!authState.profile?.id) return;

      try {
        setIsLoading(true);
        const classesData = await appController.classController.getMyClasses(
          authState.profile.id
        );
        setClasses(classesData);

        // 통계 계산
        // let activeProjects = 0;
        // let completedProjects = 0;

        // for (const classData of classesData) {
        //   const classStats =
        //     await appController.classController.getClassStatistics(
        //       classData.id
        //     );
        //   activeProjects += classStats.researchProjects;
        //   completedProjects += classStats.completedProjects;
        // }

        // setStats({
        //   totalClasses: classesData.length,
        //   activeProjects,
        //   completedProjects,
        // });
      } catch (error) {
        console.error('Failed to load classes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClasses();
  }, [appController.classController, authState.profile?.id]);

  // 검색 필터링
  const filteredClasses = classes.filter(
    (cls) =>
      cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 수업 생성 성공 핸들러
  const handleCreateSuccess = (newClass: Board) => {
    setClasses((prev) => [newClass, ...prev]);
    setShowCreateModal(false);
    // setStats((prev) => ({ ...prev, totalClasses: prev.totalClasses + 1 }));
  };

  // 수업 삭제
  const handleDeleteClass = async (classId: string) => {
    if (!confirm('정말로 이 수업을 삭제하시겠습니까?')) return;

    try {
      await appController.classController.deleteClass(classId);
      setClasses((prev) => prev.filter((cls) => cls.id !== classId));
      // setStats((prev) => ({ ...prev, totalClasses: prev.totalClasses - 1 }));
    } catch (error) {
      console.error('Failed to delete class:', error);
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      await appController.authController.signOut();
      onNavigate.toWelcome();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>수업 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* 헤더 */}
      <header className='bg-white shadow-sm border-b'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
                <BookOpen className='w-6 h-6 text-white' />
              </div>
              <div>
                <h1 className='text-xl font-bold text-gray-800'>
                  과학 탐구 여행
                </h1>
                <p className='text-sm text-gray-600'>교사 대시보드</p>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <button
                onClick={() => setShowProfileEditModal(true)} // 닉네임 클릭 시 모달 열기
                className='flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors cursor-pointer'
              >
                <Users className='w-4 h-4' />
                <span className='font-medium'>
                  {authState.profile?.display_name} 선생님
                </span>
              </button>
              <button
                onClick={handleLogout}
                className='p-2 text-gray-600 hover:text-gray-800 transition-colors'
                title='로그아웃'
              >
                <LogOut className='w-5 h-5' />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className='container mx-auto px-4 sm:px-6 md:px-8 py-8'>
        {/* 통계 카드 */}
        {/* <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>총 수업</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.totalClasses}
                </p>
              </div>
              <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
                <BookOpen className='w-6 h-6 text-blue-600' />
              </div>
            </div>
          </div>

          <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  진행 중인 탐구
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.activeProjects}
                </p>
              </div>
              <div className='w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center'>
                <TrendingUp className='w-6 h-6 text-orange-600' />
              </div>
            </div>
          </div>

          <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>완료된 탐구</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.completedProjects}
                </p>
              </div>
              <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center'>
                <BarChart3 className='w-6 h-6 text-purple-600' />
              </div>
            </div>
          </div>
        </div> */}

        {/* 수업 관리 섹션 */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
          <div className='p-6 border-b border-gray-100'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-bold text-gray-900'>내 수업</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2'
              >
                <Plus className='w-4 h-4' />
                <span>새 수업 만들기</span>
              </button>
            </div>

            {/* 검색 및 필터 */}
            <div className='flex items-center space-x-4'>
              <div className='flex-1 relative'>
                <Search className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <input
                  type='text'
                  placeholder='수업 이름으로 검색...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
              <button className='p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
                <Filter className='w-5 h-5 text-gray-600' />
              </button>
            </div>
          </div>

          <div className='p-6'>
            {filteredClasses.length === 0 ? (
              <div className='text-center py-12'>
                {classes.length === 0 ? (
                  <div>
                    <BookOpen className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>
                      아직 수업이 없습니다
                    </h3>
                    <p className='text-gray-600 mb-6'>
                      첫 번째 수업을 만들어서 학생들과 함께 과학 탐구를
                      시작해보세요!
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className='px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
                    >
                      수업 만들기
                    </button>
                  </div>
                ) : (
                  <div>
                    <Search className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>
                      검색 결과가 없습니다
                    </h3>
                    <p className='text-gray-600'>다른 검색어로 시도해보세요.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
                {filteredClasses.map((cls) => (
                  <ClassCard
                    key={cls.id}
                    class={cls}
                    onEnter={() => onNavigate.toBoard(cls)}
                    onDelete={() => handleDeleteClass(cls.id)}
                    classController={appController.classController}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 수업 생성 모달 */}
      {showCreateModal && (
        <CreateClassModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          classController={appController.classController}
          teacherId={authState.profile?.id || ''}
        />
      )}

      {/* 프로필 편집 모달 */}
      {showProfileEditModal && authState.profile && (
        <ProfileEditModal
          onClose={() => setShowProfileEditModal(false)}
          onSuccess={(updatedProfile) => {
            // AuthController에서 이미 상태를 업데이트하므로 여기서는 추가 작업 불필요
            console.log(
              `프로필 업데이트 성공! 이름: ${updatedProfile.display_name}, 학교: ${updatedProfile.school}`
            );
          }}
          authController={appController.authController}
          currentProfile={authState.profile}
        />
      )}
    </div>
  );
};

// 수업 카드 컴포넌트
interface ClassCardProps {
  class: Board;
  onEnter: () => void;
  onDelete: () => void;
  classController: ClassController;
}

const ClassCard: React.FC<ClassCardProps> = ({
  class: cls,
  onEnter,
  onDelete,
  classController,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [stats, setStats] = useState({
    participants: 0,
    projects: 0,
    averageProgress: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const classStats = await classController.getClassStatistics(cls.id);
        setStats({
          participants: classStats.totalStudents,
          projects: classStats.researchProjects,
          averageProgress: classStats.averageProgress,
        });
      } catch (error) {
        console.error('Failed to load class stats:', error);
      }
    };

    loadStats();
  }, [cls.id, classController]);

  const handleCopyCode = () => {
    classController.copyClassCode(cls.class_code);
    setShowMenu(false);
  };

  const handleShare = () => {
    classController.copyShareUrl(cls.class_code);
    setShowMenu(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className='bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow'>
      <div
        className='h-24 rounded-t-xl bg-gradient-to-r from-blue-500 to-purple-600'
        style={{ backgroundColor: cls.background_color }}
      ></div>

      <div className='p-6'>
        <div className='flex items-start justify-between mb-4'>
          <h3 className='font-bold text-lg text-gray-900 line-clamp-2'>
            {cls.title}
          </h3>
          <div className='relative'>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className='p-1 text-gray-400 hover:text-gray-600 transition-colors'
            >
              <MoreVertical className='w-4 h-4' />
            </button>

            {showMenu && (
              <div className='absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10'>
                <button
                  onClick={handleCopyCode}
                  className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2'
                >
                  <Copy className='w-4 h-4' />
                  <span>수업 코드 복사</span>
                </button>
                <button
                  onClick={handleShare}
                  className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2'
                >
                  <Share2 className='w-4 h-4' />
                  <span>공유 링크 복사</span>
                </button>
                <hr className='my-1' />
                <button
                  onClick={onDelete}
                  className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2'
                >
                  <Trash2 className='w-4 h-4' />
                  <span>수업 삭제</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {cls.description && (
          <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
            {cls.description}
          </p>
        )}

        <div className='space-y-3 mb-6'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-600'>수업 코드</span>
            <span className='font-mono font-bold text-blue-600'>
              {cls.class_code}
            </span>
          </div>

          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-600'>진행 중인 탐구</span>
            <span className='font-medium'>{stats.projects}개</span>
          </div>

          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-600'>평균 진행률</span>
            <span className='font-medium'>{stats.averageProgress}%</span>
          </div>
        </div>

        <div className='flex items-center justify-between text-xs text-gray-500 mb-4'>
          <div className='flex items-center space-x-1'>
            <Calendar className='w-3 h-3' />
            <span>생성: {formatDate(cls.created_at)}</span>
          </div>
          <div className='flex items-center space-x-1'>
            <Clock className='w-3 h-3' />
            <span>업데이트: {formatDate(cls.updated_at)}</span>
          </div>
        </div>

        <button
          onClick={onEnter}
          className='w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium'
        >
          수업 입장하기
        </button>
      </div>
    </div>
  );
};

export default DashboardView;
