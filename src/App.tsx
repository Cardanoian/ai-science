import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppController } from './controllers/AppController';
import type { AuthState } from './controllers/AuthController';
import type { Board } from './models/types';

// Views
import WelcomeView from './views/WelcomeView';
import DashboardView from './views/DashboardView';
import BoardView from './views/BoardView';
import ResearchView from './views/ResearchView';
import LoadingView from './views/LoadingView';

// 앱 상태 타입
interface AppState {
  currentView: 'welcome' | 'dashboard' | 'board' | 'research' | 'loading';
  currentBoard: Board | null;
  currentNoteId: string | null;
  isInitialized: boolean;
}

const App: React.FC = () => {
  const [appController] = useState(() => new AppController());
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const [appState, setAppState] = useState<AppState>({
    currentView: 'loading',
    currentBoard: null,
    currentNoteId: null,
    isInitialized: false,
  });

  // 앱 초기화
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await appController.initialize();

        // URL 파라미터 확인 (수업 참여 링크)
        const urlParams = new URLSearchParams(window.location.search);
        const joinCode = urlParams.get('join');

        if (joinCode) {
          // 수업 참여 플로우
          setAppState((prev) => ({
            ...prev,
            currentView: 'welcome',
            isInitialized: true,
          }));
        } else {
          // 일반 플로우
          setAppState((prev) => ({
            ...prev,
            currentView: 'welcome',
            isInitialized: true,
          }));
        }
      } catch (error) {
        console.error('App initialization failed:', error);
        setAppState((prev) => ({
          ...prev,
          currentView: 'welcome',
          isInitialized: true,
        }));
      }
    };

    initializeApp();
  }, [appController]);

  // 인증 상태 구독
  useEffect(() => {
    const unsubscribe = appController.authController.subscribe(
      (newAuthState) => {
        setAuthState(newAuthState);

        // 인증 상태에 따른 뷰 변경
        if (newAuthState.isAuthenticated && newAuthState.profile) {
          if (
            appState.currentView === 'welcome' ||
            appState.currentView === 'loading'
          ) {
            setAppState((prev) => ({ ...prev, currentView: 'dashboard' }));
          }
        } else if (!newAuthState.isAuthenticated && !newAuthState.isLoading) {
          setAppState((prev) => {
            if (
              prev.currentView === 'board' ||
              prev.currentView === 'research'
            ) {
              return prev;
            }
            return {
              ...prev,
              currentView: 'welcome',
              currentBoard: null,
              currentNoteId: null,
            };
          });
        }
      }
    );

    return unsubscribe;
  }, [appController.authController]);

  // 뷰 전환 핸들러들 (useCallback으로 최신 상태 보장)

  const handleNavigate = {
    toWelcome: useCallback(() => {
      setAppState((prev) => ({
        ...prev,
        currentView: 'welcome',
        currentBoard: null,
        currentNoteId: null,
      }));
    }, []),

    toDashboard: useCallback(() => {
      setAppState((prev) => ({ ...prev, currentView: 'dashboard' }));
    }, []),

    toBoard: useCallback((board: Board) => {
      setAppState((prev) => ({
        ...prev,
        currentView: 'board',
        currentBoard: board,
      }));
    }, []),

    toResearch: useCallback((board: Board, noteId: string) => {
      setAppState((prev) => ({
        ...prev,
        currentView: 'research',
        currentBoard: board,
        currentNoteId: noteId,
      }));
    }, []),

    back: useCallback(() => {
      setAppState((prev) => {
        if (prev.currentView === 'research') {
          return { ...prev, currentView: 'board' };
        } else if (prev.currentView === 'board') {
          return authState.isAuthenticated && authState.profile
            ? { ...prev, currentView: 'dashboard', currentBoard: null }
            : { ...prev, currentView: 'welcome' };
        } else {
          return { ...prev, currentView: 'welcome' };
        }
      });
    }, [authState.isAuthenticated, authState.profile]),
  };

  // 로딩 중이면 로딩 뷰 표시
  if (!appState.isInitialized || authState.isLoading) {
    return <LoadingView />;
  }

  // 현재 뷰 렌더링
  const renderCurrentView = () => {
    switch (appState.currentView) {
      case 'welcome':
        return (
          <WelcomeView
            appController={appController}
            authState={authState}
            onNavigate={handleNavigate}
          />
        );

      case 'dashboard':
        return (
          <DashboardView
            appController={appController}
            authState={authState}
            onNavigate={handleNavigate}
          />
        );

      case 'board':
        return (
          <BoardView
            appController={appController}
            authState={authState}
            board={appState.currentBoard!}
            onNavigate={handleNavigate}
          />
        );

      case 'research':
        return (
          <ResearchView
            appController={appController}
            authState={authState}
            board={appState.currentBoard!}
            noteId={appState.currentNoteId!}
            onNavigate={handleNavigate}
          />
        );

      default:
        return (
          <WelcomeView
            appController={appController}
            authState={authState}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {renderCurrentView()}

      {/* Toast 알림 */}
      <Toaster
        position='top-right'
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </div>
  );
};

export default App;
