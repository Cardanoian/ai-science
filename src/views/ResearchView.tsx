import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Lightbulb,
  FlaskConical,
  BarChart3,
  Presentation,
  Heart,
  ChevronRight,
  ChevronLeft,
  Save,
  Download,
  Bot,
  Sparkles,
} from 'lucide-react';
import type { AppController } from '../controllers/AppController';
import type { AuthState } from '../controllers/AuthController';
import type {
  Board,
  ResearchProject,
  ResearchStepContent,
} from '../models/types';
import ResearchSteps from './components/ResearchSteps';
import AIChat from './components/AIChat';
import { supabase } from '../lib/supabase';

interface ResearchViewProps {
  appController: AppController;
  authState: AuthState;
  board: Board;
  noteId: string;
  onNavigate: {
    toBoard: (board: Board) => void;
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

const ResearchView: React.FC<ResearchViewProps> = ({
  appController,
  authState,
  board,
  noteId,
  onNavigate,
}) => {
  const [project, setProject] = useState<ResearchProject | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState<Record<number, ResearchStepContent>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    Array<{
      type: 'user' | 'ai';
      content: string;
      timestamp: Date;
    }>
  >([]);

  // 프로젝트 초기화 및 로드
  useEffect(() => {
    const initializeProject = async () => {
      try {
        setIsLoading(true);

        // 기존 프로젝트 조회 또는 새로 생성
        let projectData =
          await appController.researchController.getProjectByNoteId(noteId);
        if (!projectData) {
          projectData = await appController.researchController.createProject(
            noteId,
            '나의 탐구 프로젝트'
          );
        }

        setProject(projectData);
        setCurrentStep(projectData.current_step);

        // AI 채팅 메시지 불러오기
        try {
          type AIChatMessageRow = {
            type: 'user' | 'ai';
            content: string;
            created_at: string;
          };
          const { data: chatData, error: chatError } = await supabase
            .from('ai_chat_messages')
            .select('type, content, created_at')
            .eq('research_id', projectData.id)
            .order('created_at', { ascending: true });

          if (chatError) {
            console.error('AI 채팅 메시지 불러오기 실패:', chatError);
          } else if (chatData) {
            setAiMessages(
              (chatData as AIChatMessageRow[]).map((msg) => ({
                type: msg.type,
                content: msg.content,
                timestamp: new Date(msg.created_at),
              }))
            );
          }
        } catch (e) {
          console.error('AI 채팅 메시지 불러오기 오류:', e);
        }

        // 각 단계 데이터 로드
        const allStepData: Record<number, object> = {};
        for (let i = 1; i <= 6; i++) {
          const stepInfo = await appController.researchController.getStepData(
            projectData.id,
            i
          );
          if (stepInfo) {
            allStepData[i] = stepInfo.content;
          }
        }
        setStepData(allStepData);
      } catch (error) {
        console.error('Failed to initialize project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeProject();
  }, [
    appController.researchController,
    noteId,
    authState.profile?.display_name,
  ]);

  // 단계 데이터 저장
  const handleSaveStep = async (
    stepNumber: number,
    content: object,
    completed: boolean = false
  ) => {
    if (!project) return;

    try {
      setIsSaving(true);
      await appController.researchController.saveStepData(
        project.id,
        stepNumber,
        content,
        completed
      );

      setStepData((prev) => ({ ...prev, [stepNumber]: content }));

      // 현재 단계 업데이트
      if (stepNumber > currentStep) {
        setCurrentStep(stepNumber);
      }
    } catch (error) {
      console.error('Failed to save step:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 단계 변경 시 개별+전체 저장
  const handleStepChange = async (newStep: number) => {
    if (!project) return;
    // 현재 단계 저장
    await handleSaveStep(currentStep, stepData[currentStep] || {});
    // 전체 단계 데이터 만들기 (빈 값은 null)
    const allStepsData: Record<number, ResearchStepContent | null> = {};
    for (let i = 1; i <= 6; i++) {
      allStepsData[i] = stepData[i] || null;
    }
    await appController.researchController.saveAllStepsData(
      project.id,
      allStepsData
    );
    setCurrentStep(newStep);
  };

  // AI 도움 요청 (현재 단계 입력 데이터도 함께 전달)
  const [isAIRequesting, setIsAIRequesting] = useState(false);

  const handleAIHelp = async (question: string) => {
    if (isAIRequesting) return;

    if (!project) {
      return;
    }
    try {
      setIsAIRequesting(true);
      const now = new Date();

      // 사용자 메시지 추가
      const userMessage = {
        type: 'user' as const,
        content: question,
        timestamp: now,
      };
      setAiMessages((prev) => [...prev, userMessage]);
      // supabase에 사용자 메시지 저장
      await supabase.from('ai_chat_messages').insert([
        {
          research_id: project.id,
          type: 'user',
          content: question,
          step: currentStep,
          created_at: now.toISOString(),
        },
      ]);

      // AI 응답 요청 (현재 단계 입력 데이터도 함께 전달)
      const response =
        await appController.researchController.generateAIFeedback(
          question,
          currentStep,
          stepData[currentStep] || {}
        );

      const aiNow = new Date();

      // AI 응답 추가
      const aiMessage = {
        type: 'ai' as const,
        content: response,
        timestamp: aiNow,
      };
      setAiMessages((prev) => [...prev, aiMessage]);

      // supabase에 AI 메시지 저장
      if (project) {
        await supabase.from('ai_chat_messages').insert([
          {
            research_id: project.id,
            type: 'ai',
            content: response,
            step: currentStep,
            created_at: aiNow.toISOString(),
          },
        ]);
      }

      // AI 채팅 패널 표시
      setShowAIChat(true);
    } catch (error) {
      console.error('Failed to get AI help:', error);
    } finally {
      setIsAIRequesting(false);
    }
  };

  // 진행률 계산
  const calculateProgress = () => {
    if (!project) return 0;
    return Math.round((currentStep / 6) * 100);
  };

  // 프로젝트 내보내기
  const handleExport = async () => {
    if (!project) return;

    try {
      const exportData = {
        project,
        steps: stepData,
        timestamp: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.title || '탐구프로젝트'}_${
        new Date().toISOString().split('T')[0]
      }.json`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export project:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>탐구 프로젝트를 준비하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* 헤더 */}
      <header className='bg-white shadow-sm border-b sticky top-0 z-40'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => onNavigate.toBoard(board)}
                className='p-2 text-gray-600 hover:text-gray-800 transition-colors'
                title='보드로 돌아가기'
              >
                <ArrowLeft className='w-5 h-5' />
              </button>

              <div>
                <h1 className='text-xl font-bold text-gray-800'>
                  {project?.title || '나의 탐구 프로젝트'}
                </h1>
                <div className='flex items-center space-x-4 text-sm text-gray-600'>
                  <span>탐구자: {project?.student_name}</span>
                  <span>진행률: {calculateProgress()}%</span>
                  <span>현재 단계: {currentStep}/6</span>
                </div>
              </div>
            </div>

            <div className='flex items-center space-x-3'>
              <button
                onClick={() =>
                  handleSaveStep(currentStep, stepData[currentStep] || {})
                }
                disabled={isSaving}
                className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50'
              >
                <Save className='w-4 h-4' />
                <span>{isSaving ? '저장 중...' : '저장'}</span>
              </button>

              <button
                onClick={handleExport}
                className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2'
              >
                <Download className='w-4 h-4' />
                <span>내보내기</span>
              </button>

              <button
                onClick={() => setShowAIChat(!showAIChat)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  showAIChat
                    ? 'bg-blue-500 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                }`}
              >
                <Bot className='w-4 h-4' />
                <span>AI 도움</span>
                {aiMessages.length > 0 && (
                  <span className='bg-white/20 text-xs px-2 py-1 rounded-full'>
                    {aiMessages.filter((m) => m.type === 'ai').length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className='container mx-auto px-4 py-6'>
        <div className='grid grid-cols-1 xl:grid-cols-4 gap-6'>
          {/* 사이드바 - 단계 네비게이션 */}
          <div className='xl:col-span-1'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24'>
              <h2 className='font-bold text-lg mb-6 text-gray-800'>
                탐구 단계
              </h2>

              <div className='space-y-3'>
                {RESEARCH_STEPS.map((step) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  const hasData =
                    Object.keys(stepData[step.id] || {}).length > 0;

                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(step.id)}
                      className={`w-full flex items-center space-x-3 p-4 rounded-xl text-left transition-all ${
                        isActive
                          ? `${step.color} text-white shadow-md`
                          : isCompleted
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : hasData
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isActive
                            ? 'bg-white bg-opacity-20'
                            : isCompleted
                            ? 'bg-green-200'
                            : hasData
                            ? 'bg-blue-200'
                            : 'bg-gray-200'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            isActive
                              ? 'text-white'
                              : isCompleted
                              ? 'text-green-600'
                              : hasData
                              ? 'text-blue-600'
                              : 'text-gray-600'
                          }`}
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium text-sm truncate'>
                          {step.id}단계
                        </div>
                        <div className='text-xs opacity-80 truncate'>
                          {step.title}
                        </div>
                      </div>
                      {isCompleted && (
                        <div className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center'>
                          <span className='text-white text-xs'>✓</span>
                        </div>
                      )}
                      {hasData && !isCompleted && !isActive && (
                        <div className='w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center'>
                          <span className='text-white text-xs'>•</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 진행률 표시 */}
              <div className='mt-8 p-4 bg-gray-50 rounded-xl'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm font-medium text-gray-700'>
                    전체 진행률
                  </span>
                  <span className='text-sm font-bold text-blue-600'>
                    {calculateProgress()}%
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-3'>
                  <div
                    className='bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500'
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
                <p className='text-xs text-gray-500 mt-2'>
                  {currentStep}/6 단계 완료
                </p>
              </div>
            </div>
          </div>

          {/* 메인 컨텐츠 */}
          <div className={showAIChat ? 'xl:col-span-2' : 'xl:col-span-3'}>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
              {/* 단계 헤더 */}
              <div className='p-6 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    {(() => {
                      const step = RESEARCH_STEPS[currentStep - 1];
                      const Icon = step.icon;
                      return (
                        <>
                          <div
                            className={`${step.color} w-12 h-12 rounded-xl flex items-center justify-center`}
                          >
                            <Icon className='w-6 h-6 text-white' />
                          </div>
                          <div>
                            <h2 className='text-2xl font-bold text-gray-800'>
                              {currentStep}단계: {step.title}
                            </h2>
                            <p className='text-gray-600 mt-1'>
                              {step.description}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className='flex items-center space-x-2'>
                    <button
                      onClick={() =>
                        handleStepChange(Math.max(1, currentStep - 1))
                      }
                      disabled={currentStep === 1}
                      className='p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                    >
                      <ChevronLeft className='w-5 h-5' />
                    </button>
                    <button
                      onClick={() =>
                        handleStepChange(Math.min(6, currentStep + 1))
                      }
                      disabled={currentStep === 6}
                      className='p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                    >
                      <ChevronRight className='w-5 h-5' />
                    </button>
                  </div>
                </div>
              </div>

              {/* 단계별 컨텐츠 */}
              <div className='p-6'>
                <ResearchSteps
                  currentStep={currentStep}
                  stepData={stepData[currentStep] || {}}
                  onDataChange={(data) => {
                    setStepData((prev) => ({ ...prev, [currentStep]: data }));
                  }}
                  onSave={(data, completed) =>
                    handleSaveStep(currentStep, data, completed)
                  }
                  onAIHelp={handleAIHelp}
                  researchController={appController.researchController}
                />
              </div>

              {/* 하단 네비게이션 */}
              <div className='p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl'>
                <div className='flex items-center justify-between'>
                  <button
                    onClick={() =>
                      handleStepChange(Math.max(1, currentStep - 1))
                    }
                    disabled={currentStep === 1}
                    className='flex items-center space-x-2 px-6 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    <ChevronLeft className='w-4 h-4' />
                    <span>이전</span>
                  </button>

                  <div className='flex items-center space-x-3'>
                    <button
                      onClick={() =>
                        handleSaveStep(currentStep, stepData[currentStep] || {})
                      }
                      disabled={isSaving}
                      className='px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50'
                    >
                      {isSaving ? '저장 중...' : '저장'}
                    </button>

                    <button
                      onClick={() =>
                        handleAIHelp('현재 단계에 대한 도움을 받고 싶어요')
                      }
                      disabled={isAIRequesting}
                      className={`px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white transition-colors flex items-center space-x-2 ${
                        isAIRequesting
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:from-blue-600 hover:to-purple-700'
                      }`}
                    >
                      <Sparkles className='w-4 h-4' />
                      <span>
                        {isAIRequesting ? 'AI 응답 대기 중...' : 'AI 도움 받기'}
                      </span>
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      handleStepChange(Math.min(6, currentStep + 1))
                    }
                    disabled={currentStep === 6}
                    className='flex items-center space-x-2 px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    <span>다음</span>
                    <ChevronRight className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI 채팅 모달 */}
          {showAIChat && (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
              <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative'>
                <div className='p-6'>
                  <AIChat
                    messages={aiMessages}
                    onSendMessage={handleAIHelp}
                    onClose={() => setShowAIChat(false)}
                    currentStep={currentStep}
                    stepData={stepData[currentStep] || {}}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResearchView;
