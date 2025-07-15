import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Save,
  Bot,
  Info,
} from 'lucide-react';
import type { ResearchStepContent } from '../models/types';
import ResearchSteps from './components/ResearchSteps';
import AIChat from './components/AIChat';
import PresentationModal from './components/PresentationModal';
import toast from 'react-hot-toast';
import RESEARCH_STEPS from '../constants/researchSteps';
import { SCIENCE_TOPICS } from '../constants/topics';
import { TUTORIAL_DATA } from '../constants/tutorialData';

interface TutorialViewProps {
  topic: (typeof SCIENCE_TOPICS)[0];
  onNavigate: {
    back: () => void;
  };
}

const TutorialView: React.FC<TutorialViewProps> = ({ topic, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState<Record<number, ResearchStepContent>>(
    {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    Array<{ type: 'user' | 'ai'; content: string; timestamp: Date }>
  >([]);
  const [showPresentationModal, setShowPresentationModal] = useState(false);
  const [presentationHtml, setPresentationHtml] = useState<string | null>(null);
  const [isAIRequesting, setIsAIRequesting] = useState(false);

  useEffect(() => {
    // 튜토리얼 시작 시, 주제에 맞는 데이터 미리 채우기
    const presetData =
      TUTORIAL_DATA[topic.title] || TUTORIAL_DATA['식물과 빛의 관계'];
    setStepData(presetData);
  }, [topic]);

  const handleSaveStep = async (stepNumber: number, content: object) => {
    setIsSaving(true);
    // 실제 저장 로직 대신, 로컬 상태만 업데이트하고 잠시 딜레이를 줍니다.
    setStepData((prev) => ({ ...prev, [stepNumber]: content }));
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success('튜토리얼 진행 상황이 임시 저장되었습니다.');
    setIsSaving(false);
  };

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
  };

  const handleAIHelp = async (question: string) => {
    if (isAIRequesting) return;
    setIsAIRequesting(true);

    const userMessage = {
      type: 'user' as const,
      content: question,
      timestamp: new Date(),
    };
    setAiMessages((prev) => [...prev, userMessage]);

    // 가짜 AI 응답
    setTimeout(() => {
      const aiResponse = `안녕하세요! 튜토리얼 모드입니다. 실제 서비스에서는 이 질문에 대해 AI가 답변해 드릴 거예요. 예를 들어, "${question}"에 대해서는 다음과 같은 답변을 드릴 수 있습니다. (이하 AI 답변 예시...)`;
      const aiMessage = {
        type: 'ai' as const,
        content: aiResponse,
        timestamp: new Date(),
      };
      setAiMessages((prev) => [...prev, aiMessage]);
      setIsAIRequesting(false);
    }, 1000);

    setShowAIChat(true);
  };

  const handleGeneratePresentation = async () => {
    setIsAIRequesting(true);
    toast.loading('발표자료를 생성 중입니다...');

    // 가짜 발표자료 HTML 생성
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const generatedHtml = `
      <html>
        <head>
          <title>${topic.title}</title>
          <style>body { font-family: sans-serif; padding: 2rem; } h1, h2 { color: #333; }</style>
        </head>
        <body>
          <h1>${topic.title}</h1>
          <h2>탐구 동기</h2>
          <p>${stepData[1]?.topicReason || '튜토리얼 탐구 동기'}</p>
          <h2>탐구 질문</h2>
          <p>${stepData[1]?.researchQuestion || '튜토리얼 탐구 질문'}</p>
          <h2>가설</h2>
          <p>${stepData[2]?.hypothesis || '튜토리얼 가설'}</p>
          <p>...</p>
          <hr/>
          <p><em>이것은 튜토리얼용으로 생성된 발표자료 예시입니다.</em></p>
        </body>
      </html>
    `;
    setPresentationHtml(generatedHtml);
    setShowPresentationModal(true);
    toast.success('발표자료가 성공적으로 생성되었습니다!');
    setIsAIRequesting(false);
  };

  const handleViewPresentation = () => {
    if (presentationHtml) {
      setShowPresentationModal(true);
    } else {
      toast.error('생성된 발표자료가 없습니다. 먼저 생성해주세요.');
    }
  };

  const calculateProgress = () => Math.round((currentStep / 6) * 100);

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow-sm border-b sticky top-0 z-40'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <button
                onClick={onNavigate.back}
                className='p-2 text-gray-600 hover:text-gray-800 transition-colors'
                title='돌아가기'
              >
                <ArrowLeft className='w-5 h-5' />
              </button>
              <div>
                <h1 className='text-xl font-bold text-gray-800'>
                  {topic.title} (튜토리얼)
                </h1>
                <div className='items-center space-x-4 text-sm text-gray-600 hidden md:flex'>
                  <span>진행률: {calculateProgress()}%</span>
                  <span>현재 단계: {currentStep}/6</span>
                  <div className='flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium'>
                    <Info className='w-3 h-3' />
                    <span>체험판</span>
                  </div>
                </div>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() =>
                  handleSaveStep(currentStep, stepData[currentStep] || {})
                }
                disabled={isSaving}
                className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50 h-10'
              >
                <Save className='w-4 h-4' />
                <span className='hidden md:inline flex-shrink-0'>
                  {isSaving ? '저장 중...' : '임시 저장'}
                </span>
              </button>
              <button
                onClick={() => setShowAIChat(!showAIChat)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 h-10 ${
                  showAIChat
                    ? 'bg-blue-500 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                }`}
              >
                <Bot className='w-4 h-4' />
                <span className='hidden md:inline flex-shrink-0'>AI 도움</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className='container mx-auto px-4 py-6'>
        <div className='grid grid-cols-1 xl:grid-cols-4 gap-6'>
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
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={showAIChat ? 'xl:col-span-2' : 'xl:col-span-3'}>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
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
                  <div className='items-center space-x-2 hidden md:flex'>
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
              <div className='p-6'>
                <ResearchSteps
                  currentStep={currentStep}
                  stepData={stepData[currentStep] || {}}
                  onDataChange={(data) =>
                    setStepData((prev) => ({ ...prev, [currentStep]: data }))
                  }
                  onSave={(data) => handleSaveStep(currentStep, data)}
                  onAIHelp={handleAIHelp}
                  onGeneratePresentation={handleGeneratePresentation}
                  onViewPresentation={handleViewPresentation}
                  isAIRequesting={isAIRequesting}
                  isTutorial={true}
                />
              </div>
              <div className='p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl'>
                <div className='flex items-center justify-between'>
                  <button
                    onClick={() =>
                      handleStepChange(Math.max(1, currentStep - 1))
                    }
                    disabled={currentStep === 1}
                    className='flex items-center space-x-2 px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                  >
                    <ChevronLeft className='w-4 h-4' />
                    <span className='hidden md:inline'>이전</span>
                  </button>
                  <button
                    onClick={() =>
                      handleStepChange(Math.min(6, currentStep + 1))
                    }
                    disabled={currentStep === 6}
                    className='flex items-center space-x-2 px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                  >
                    <span className='hidden md:inline'>다음</span>
                    <ChevronRight className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>
          </div>

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

          {showPresentationModal && presentationHtml && (
            <PresentationModal
              htmlContent={presentationHtml}
              onClose={() => setShowPresentationModal(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialView;
