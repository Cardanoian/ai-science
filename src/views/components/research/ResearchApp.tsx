// src/views/components/ResearchApp.tsx
import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Users,
  Lightbulb,
} from 'lucide-react';
import { ResearchController } from '../../controllers/ResearchController';
import { ResearchProject, RESEARCH_STEPS } from '../../models/research-types';
import { StepContent } from './research/StepContent';
import { ProgressBar } from './research/ProgressBar';
import { GuideModal } from './research/GuideModal';
import { TopicRecommendation } from './research/TopicRecommendation';
import toast from 'react-hot-toast';

interface ResearchAppProps {
  noteId: string;
  noteTitle?: string;
  onClose: () => void;
}

export const ResearchApp: React.FC<ResearchAppProps> = ({
  noteId,
  noteTitle,
  onClose,
}) => {
  const [controller] = useState(() => new ResearchController());
  const [project, setProject] = useState<ResearchProject | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [showTopicRecommendation, setShowTopicRecommendation] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');

  useEffect(() => {
    initializeProject();
  }, [noteId]);

  const initializeProject = async () => {
    try {
      setLoading(true);

      // 학생 이름을 로컬 스토리지에서 가져오기
      const savedName = localStorage.getItem('student_name') || '';
      setStudentName(savedName);

      const proj = await controller.initializeProject(
        noteId,
        noteTitle,
        savedName
      );
      setProject(proj);
      setCurrentStep(proj.current_step);
      setProjectTitle(proj.title || noteTitle || '');

      // 첫 번째 방문시 가이드 표시
      const hasSeenGuide = localStorage.getItem('research_guide_seen');
      if (!hasSeenGuide) {
        setShowGuide(true);
        localStorage.setItem('research_guide_seen', 'true');
      }
    } catch (error) {
      console.error('Error initializing project:', error);
      toast.error('프로젝트 초기화에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStepChange = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= 6) {
      setCurrentStep(stepNumber);
    }
  };

  const handleStepComplete = async (
    stepNumber: number,
    data: any,
    completed: boolean = true
  ) => {
    if (!project) return;

    try {
      await controller.saveStepData(project.id, stepNumber, data, completed);

      // 프로젝트 정보 업데이트
      if (stepNumber === 1 && data.title && data.title !== project.title) {
        setProjectTitle(data.title);
      }

      if (data.studentName && data.studentName !== studentName) {
        setStudentName(data.studentName);
        localStorage.setItem('student_name', data.studentName);
      }

      // 다음 단계로 자동 이동 (마지막 단계가 아닌 경우)
      if (completed && stepNumber < 6) {
        setCurrentStep(stepNumber + 1);
      }
    } catch (error) {
      console.error('Error saving step:', error);
    }
  };

  const getCurrentStepInfo = () => {
    return RESEARCH_STEPS.find((step) => step.number === currentStep);
  };

  if (loading) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-lg p-8 text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>탐구 앱을 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 bg-white z-50 overflow-hidden'>
      {/* 헤더 */}
      <div className='bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <BookOpen size={28} />
              <div>
                <h1 className='text-xl font-bold'>
                  {projectTitle || '과학 탐구 학습'}
                </h1>
                <p className='text-blue-100 text-sm'>
                  {studentName && `${studentName}의 탐구 여정`}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <button
                onClick={() => setShowTopicRecommendation(true)}
                className='flex items-center gap-2 px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors text-sm'
              >
                <Lightbulb size={16} />
                주제 추천
              </button>

              <button
                onClick={() => setShowGuide(true)}
                className='flex items-center gap-2 px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors text-sm'
              >
                <Users size={16} />
                탐구 가이드
              </button>

              <button
                onClick={onClose}
                className='p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors'
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='flex h-full'>
        {/* 사이드바 - 단계 네비게이션 */}
        <div className='w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto'>
          <div className='p-4'>
            <h2 className='text-lg font-semibold text-gray-800 mb-4'>
              탐구 단계
            </h2>

            {/* 진행률 */}
            <ProgressBar
              currentStep={currentStep}
              totalSteps={6}
              className='mb-6'
            />

            {/* 단계 목록 */}
            <div className='space-y-2'>
              {RESEARCH_STEPS.map((step) => (
                <button
                  key={step.number}
                  onClick={() => handleStepChange(step.number)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentStep === step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-white hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep === step.number
                          ? 'bg-white text-blue-600'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step.number}
                    </div>
                    <div className='flex-1'>
                      <div className='font-medium'>{step.title}</div>
                      <div
                        className={`text-xs mt-1 ${
                          currentStep === step.number
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className='flex-1 overflow-y-auto'>
          <div className='max-w-4xl mx-auto p-6'>
            {/* 단계 헤더 */}
            <div className='mb-6'>
              <div className='flex items-center gap-2 text-sm text-gray-500 mb-2'>
                <span>단계 {currentStep}</span>
                <ChevronRight size={16} />
                <span>{getCurrentStepInfo()?.title}</span>
              </div>
              <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                {getCurrentStepInfo()?.title}
              </h1>
              <p className='text-gray-600'>
                {getCurrentStepInfo()?.description}
              </p>
            </div>

            {/* 단계별 컨텐츠 */}
            {project && (
              <StepContent
                projectId={project.id}
                stepNumber={currentStep}
                controller={controller}
                onStepComplete={handleStepComplete}
                stepInfo={getCurrentStepInfo()}
              />
            )}

            {/* 네비게이션 버튼 */}
            <div className='flex justify-between mt-8 pt-6 border-t'>
              <button
                onClick={() => handleStepChange(currentStep - 1)}
                disabled={currentStep === 1}
                className='flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <ChevronLeft size={16} />
                이전 단계
              </button>

              <button
                onClick={() => handleStepChange(currentStep + 1)}
                disabled={currentStep === 6}
                className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                다음 단계
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 가이드 모달 */}
      <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />

      {/* 주제 추천 모달 */}
      <TopicRecommendation
        isOpen={showTopicRecommendation}
        onClose={() => setShowTopicRecommendation(false)}
        onSelectTopic={(topic) => {
          setShowTopicRecommendation(false);
          // 1단계로 이동하고 선택된 주제 전달
          setCurrentStep(1);
        }}
      />
    </div>
  );
};
