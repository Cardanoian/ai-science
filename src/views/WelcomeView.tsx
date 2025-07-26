import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Lightbulb,
  FlaskConical,
  BarChart3,
  Presentation,
  Heart,
  Search,
  ArrowRight,
  Users,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import type { AppController } from '../controllers/AppController';
import type { AuthState } from '../controllers/AuthController';
import type { Board } from '../models/types';
import LoginModal from './components/LoginModal';
import JoinClassModal from './components/JoinClassModal';
import { SCIENCE_TOPICS } from '../constants/topics';

interface WelcomeViewProps {
  appController: AppController;
  authState: AuthState;
  onNavigate: {
    toDashboard: () => void;
    toBoard: (board: Board) => void;
    toTutorial: (topic: (typeof SCIENCE_TOPICS)[0]) => void;
  };
}

// 탐구 단계 정의
const RESEARCH_STEPS = [
  {
    id: 1,
    title: '탐구 주제 찾기',
    description: '관심 있는 현상을 관찰하고 탐구할 주제를 선정합니다.',
    icon: Search,
    color: 'bg-blue-500',
  },
  {
    id: 2,
    title: '탐구 질문과 가설',
    description:
      '관찰한 현상에 대한 질문을 만들고 예상 답안을 가설로 세웁니다.',
    icon: Lightbulb,
    color: 'bg-yellow-500',
  },
  {
    id: 3,
    title: '실험 계획하기',
    description: '가설을 검증하기 위한 실험을 구체적으로 계획합니다.',
    icon: FlaskConical,
    color: 'bg-green-500',
  },
  {
    id: 4,
    title: '결과 정리 및 결론',
    description: '실험 결과를 정리하고 분석하여 결론을 도출합니다.',
    icon: BarChart3,
    color: 'bg-purple-500',
  },
  {
    id: 5,
    title: '탐구 발표 준비',
    description: '탐구 과정과 결과를 다른 사람들에게 발표할 자료를 준비합니다.',
    icon: Presentation,
    color: 'bg-orange-500',
  },
  {
    id: 6,
    title: '성찰하기',
    description: '탐구 과정을 돌아보고 배운 점과 개선점을 정리합니다.',
    icon: Heart,
    color: 'bg-pink-500',
  },
];

const WelcomeView: React.FC<WelcomeViewProps> = ({
  appController,
  authState,
  onNavigate,
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showJoinClassModal, setShowJoinClassModal] = useState(false);

  // URL에서 join 파라미터 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');

    if (joinCode) {
      setShowJoinClassModal(true);
    }
  }, []);

  // 로그인된 사용자는 대시보드로 이동
  useEffect(() => {
    if (authState.isAuthenticated && authState.profile) {
      onNavigate.toDashboard();
    }
  }, [authState.isAuthenticated, authState.profile, onNavigate]);

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // AuthController의 구독을 통해 자동으로 대시보드로 이동됨
  };

  const handleJoinClassSuccess = (board: Board) => {
    setShowJoinClassModal(false);
    onNavigate.toBoard(board);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      {/* 헤더 */}
      <header className='bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
                <BookOpen className='w-6 h-6 text-white' />
              </div>
              <div>
                <h1 className='text-xl font-bold text-gray-800'>
                  과학 탐구 여행
                </h1>
                <p className='text-sm text-gray-600'>AI와 함께하는 학습</p>
              </div>
            </div>

            <div className='flex items-center space-x-3'>
              <button
                onClick={() => setShowJoinClassModal(true)}
                className='px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors'
              >
                수업 참여
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
              >
                로그인
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className='container mx-auto px-4 py-12'>
        {/* 히어로 섹션 */}
        <div className='text-center mb-16'>
          <div className='inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6'>
            <Sparkles className='w-4 h-4' />
            <span>AI 기반 과학 탐구 학습 플랫폼</span>
          </div>

          <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
            🔬 AI와 함께하는
            <br />
            <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              과학 탐구 여행
            </span>
          </h1>

          <p className='text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>
            궁금한 것을 스스로 찾아보는 재미있는 여행을 시작해보세요!
            <br />
            6단계 체계적인 탐구 과정으로 진짜 과학자가 되어보아요.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <button
              onClick={() => setShowLoginModal(true)}
              className='px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-lg font-semibold w-60 hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2'
            >
              <GraduationCap className='w-5 h-5' />
              <span>교사로 시작하기</span>
              <ArrowRight className='w-5 h-5' />
            </button>

            <button
              onClick={() => setShowJoinClassModal(true)}
              className='px-8 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-xl text-lg font-semibold w-60 hover:border-blue-500 hover:text-blue-600 transition-all flex items-center space-x-2'
            >
              <Users className='w-5 h-5' />
              <span>학생으로 참여하기</span>
            </button>
          </div>
        </div>

        {/* 탐구 과정 소개 */}
        <div className='mb-16'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>
              📚 과학자처럼 탐구하는 6단계
            </h2>
            <p className='text-lg text-gray-600'>
              체계적인 과정을 통해 과학적 사고력을 기를 수 있어요
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
            {RESEARCH_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className='bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1'
                >
                  <div className='flex items-center mb-4'>
                    <div
                      className={`${step.color} w-14 h-14 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className='w-7 h-7 text-white' />
                    </div>
                    <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                      <span className='text-sm font-bold text-gray-600'>
                        {step.id}
                      </span>
                    </div>
                  </div>
                  <h3 className='font-bold text-xl mb-3 text-gray-800'>
                    {step.title}
                  </h3>
                  <p className='text-gray-600 leading-relaxed'>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 추천 과학 이야기 */}
        <div className='mb-16'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>
              🌟 재미있는 과학 이야기
            </h2>
            <p className='text-lg text-gray-600'>
              관심 있는 주제를 선택해서 탐구를 시작해보세요
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-8'>
            {SCIENCE_TOPICS.map((topic) => (
              <div
                key={topic.title}
                onClick={() => onNavigate.toTutorial(topic)}
                className='bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1 cursor-pointer'
              >
                <div className='flex items-start space-x-4'>
                  <div className='text-4xl'>{topic.emoji}</div>
                  <div className='flex-1'>
                    <h3 className='font-bold text-xl mb-2 text-gray-800 group-hover:text-blue-600 transition-colors'>
                      {topic.title}
                    </h3>
                    <p className='text-gray-600 mb-4 leading-relaxed'>
                      {topic.description}
                    </p>
                    <div className='flex items-center justify-between'>
                      <span
                        className={`text-sm px-3 py-1 rounded-full font-medium ${
                          topic.difficulty === '쉬움'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {topic.difficulty}
                      </span>
                      <div className='flex flex-wrap gap-2'>
                        {topic.concepts.map((concept, i) => (
                          <span
                            key={i}
                            className='text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded font-medium'
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 특징 소개 */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-16'>
          <div className='text-center p-8'>
            <div className='w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
              <Lightbulb className='w-8 h-8 text-blue-600' />
            </div>
            <h3 className='font-bold text-xl mb-3 text-gray-800'>
              AI 맞춤 피드백
            </h3>
            <p className='text-gray-600'>
              각 단계별로 개인화된 피드백과 도움말을 받을 수 있어요
            </p>
          </div>

          <div className='text-center p-8'>
            <div className='w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
              <BarChart3 className='w-8 h-8 text-green-600' />
            </div>
            <h3 className='font-bold text-xl mb-3 text-gray-800'>
              데이터 시각화
            </h3>
            <p className='text-gray-600'>
              실험 결과를 그래프로 만들어 패턴을 쉽게 찾을 수 있어요
            </p>
          </div>

          <div className='text-center p-8'>
            <div className='w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
              <Users className='w-8 h-8 text-purple-600' />
            </div>
            <h3 className='font-bold text-xl mb-3 text-gray-800'>협업 학습</h3>
            <p className='text-gray-600'>
              친구들과 함께 탐구하고 서로의 아이디어를 나눌 수 있어요
            </p>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className='bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-12 text-center text-white'>
          <h2 className='text-2xl sm:text-3xl font-bold mb-4'>
            지금 바로 과학 탐구를 시작해보세요!
          </h2>
          <p className='text-lg sm:text-xl mb-8 opacity-90'>
            AI와 함께하는 체계적인 탐구 학습으로 진짜 과학자가 되어보아요
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button
              onClick={() => setShowLoginModal(true)}
              className='px-8 py-4 bg-white text-blue-600 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors'
            >
              교사 계정 만들기
            </button>
            <button
              onClick={() => setShowJoinClassModal(true)}
              className='px-8 py-4 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl text-lg font-semibold hover:bg-white/30 transition-colors'
            >
              수업 코드로 참여하기
            </button>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className='bg-gray-900 text-gray-300 py-12'>
        <div className='container mx-auto px-4'>
          <div className='text-center'>
            <div className='flex items-center justify-center space-x-3 mb-4'>
              <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
                <BookOpen className='w-4 h-4 text-white' />
              </div>
              <span className='text-xl font-bold text-white'>
                과학 탐구 여행
              </span>
            </div>
            <p className='text-gray-400 mb-4'>
              AI와 함께하는 자율시간 탐구학습 프로그램
            </p>
            <p className='text-sm text-gray-500'>
              © 2025 경상북도교육청 All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* 모달들 */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
          authController={appController.authController}
        />
      )}

      {showJoinClassModal && (
        <JoinClassModal
          onClose={() => setShowJoinClassModal(false)}
          onSuccess={handleJoinClassSuccess}
          classController={appController.classController}
        />
      )}
    </div>
  );
};

export default WelcomeView;
