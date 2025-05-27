import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { User } from '@supabase/supabase-js';

// 컴포넌트 imports
import { WelcomeScreen } from './views/components/WelcomeScreen';
import { TeacherDashboard } from './views/components/TeacherDashboard';
import { Board } from './views/components/Board';

// 컨트롤러 imports
import { AuthController, UserProfile } from './controllers/AuthController';
import { ClassController, ClassInfo } from './controllers/ClassController';
import { AppController } from './controllers/AppController';

// 앱 상태 타입
type AppState =
  | 'welcome' // 초기 화면
  | 'teacher-dashboard' // 교사 대시보드
  | 'class-board'; // 수업 보드 화면

function App() {
  // 컨트롤러 인스턴스
  const [authController] = useState(() => new AuthController());
  const [classController] = useState(() => new ClassController());
  const [appController] = useState(() => new AppController());

  // 상태 관리
  const [appState, setAppState] = useState<AppState>('welcome');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentClass, setCurrentClass] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 초기화 및 인증 상태 감지
  useEffect(() => {
    initializeApp();

    // 인증 상태 변화 구독
    const {
      data: { subscription },
    } = authController.onAuthStateChange(handleAuthStateChange);

    // URL 파라미터 확인 (수업 참여 링크)
    checkUrlParameters();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const initializeApp = async () => {
    try {
      const user = await authController.getCurrentUser();
      if (user) {
        await handleAuthStateChange(user);
      }
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthStateChange = async (user: User | null) => {
    setCurrentUser(user);

    if (user) {
      // 사용자 프로필 로드
      const profile = await authController.getUserProfile(user.id);
      setUserProfile(profile);

      // 교사인 경우 대시보드로, 학생인 경우는 현재 상태 유지
      if (profile?.role === 'teacher') {
        setAppState('teacher-dashboard');
      }
    } else {
      // 로그아웃 시 초기 화면으로
      setUserProfile(null);
      setCurrentClass(null);
      setAppState('welcome');
    }
  };

  const checkUrlParameters = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');

    if (joinCode) {
      // URL에 수업 참여 코드가 있는 경우 자동으로 참여 시도
      handleStudentJoin(joinCode);

      // URL 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleTeacherLogin = () => {
    // 로그인 성공 시 AuthController의 onAuthStateChange에서 자동 처리됨
  };

  const handleStudentJoin = async (classCode: string, studentName?: string) => {
    try {
      const classInfo = await classController.joinClassByCode(
        classCode,
        studentName
      );

      if (classInfo) {
        setCurrentClass(classInfo);
        setAppState('class-board');
      }
    } catch (error) {
      console.error('Student join error:', error);
    }
  };

  const handleSelectClass = (classInfo: ClassInfo) => {
    setCurrentClass(classInfo);
    setAppState('class-board');
  };

  const handleBackToHome = () => {
    if (currentUser && userProfile?.role === 'teacher') {
      setAppState('teacher-dashboard');
    } else {
      setAppState('welcome');
    }
    setCurrentClass(null);
  };

  const handleLogout = async () => {
    try {
      await authController.signOut();
      // AuthController의 onAuthStateChange에서 자동으로 상태 변경됨
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // 로딩 화면
  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600 text-lg'>앱을 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  // 상태별 화면 렌더링
  return (
    <>
      {appState === 'welcome' && (
        <WelcomeScreen
          onTeacherLogin={handleTeacherLogin}
          onStudentJoin={handleStudentJoin}
        />
      )}

      {appState === 'teacher-dashboard' && currentUser && (
        <TeacherDashboard
          user={currentUser}
          onSelectClass={handleSelectClass}
          onLogout={handleLogout}
        />
      )}

      {appState === 'class-board' && currentClass && (
        <Board
          board={{
            id: currentClass.id,
            title: currentClass.title,
            description: currentClass.description,
            background_color: currentClass.background_color,
            created_at: currentClass.created_at,
            updated_at: currentClass.created_at,
          }}
          appController={appController}
          onBackToHome={handleBackToHome}
          classCode={currentClass.class_code}
          isTeacher={userProfile?.role === 'teacher'}
        />
      )}

      {/* 토스트 알림 */}
      <Toaster
        position='top-right'
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 2000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#f87171',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;
