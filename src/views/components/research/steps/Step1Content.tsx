// src/views/components/research/steps/Step1Content.tsx (워크북 연동)
import React, { useState } from 'react';
import {
  Lightbulb,
  Save,
  BookOpen,
  Heart,
  Zap,
  Leaf,
  Globe,
} from 'lucide-react';
import { ResearchController } from '../../../../controllers/ResearchController';
import { GeminiAIService } from '../../../../services/GeminiService';

interface Step1ContentProps {
  projectId: string;
  controller: ResearchController;
  onStepComplete: (data: any, completed?: boolean) => Promise<void>;
  stepInfo: any;
}

export const Step1Content: React.FC<Step1ContentProps> = ({
  projectId,
  controller,
  onStepComplete,
  stepInfo,
}) => {
  const [geminiService] = useState(() => new GeminiAIService());

  // 워크북의 항목들
  const [personalInterests, setPersonalInterests] = useState('');
  const [aiTopicRecommendations, setAiTopicRecommendations] = useState('');
  const [selectedAITopic, setSelectedAITopic] = useState('');
  const [myModifications, setMyModifications] = useState('');
  const [finalTopic, setFinalTopic] = useState('');

  // UI 상태
  const [isGettingRecommendations, setIsGettingRecommendations] =
    useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showInterestExamples, setShowInterestExamples] = useState(false);

  const categories = [
    { id: 'physics', name: '물리', icon: Zap, desc: '힘, 에너지, 운동 등' },
    {
      id: 'chemistry',
      name: '화학',
      icon: Heart,
      desc: '물질의 변화, 반응 등',
    },
    { id: 'biology', name: '생물', icon: Leaf, desc: '동물, 식물, 생명 현상' },
    { id: 'earth', name: '지구과학', icon: Globe, desc: '날씨, 환경, 우주 등' },
  ];

  const interestExamples = [
    '동물을 좋아해요',
    '요리하는 것이 재미있어요',
    '운동을 즐겨해요',
    '음악을 듣는 것을 좋아해요',
    '게임하는 것이 재미있어요',
    '그림 그리기를 좋아해요',
    '책 읽기를 좋아해요',
    '여행하는 것이 좋아요',
    '영화 보는 것을 좋아해요',
  ];

  const getAITopicRecommendations = async () => {
    if (!personalInterests.trim()) {
      alert('먼저 관심 있는 것들을 적어주세요!');
      return;
    }

    setIsGettingRecommendations(true);
    try {
      const interests = personalInterests
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item);
      const response = await geminiService.recommendTopics({
        interests,
        category: selectedCategory,
      });

      if (response.success) {
        setAiTopicRecommendations(response.message);
      } else {
        alert('주제 추천을 받는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      alert('AI 서비스 연결에 문제가 있습니다.');
    } finally {
      setIsGettingRecommendations(false);
    }
  };

  const handleSave = async () => {
    const data = {
      personalInterests,
      aiTopicRecommendations,
      selectedAITopic,
      myModifications,
      finalTopic,
      selectedCategory,
    };

    await onStepComplete(data, false);
  };

  const handleComplete = async () => {
    if (!finalTopic.trim()) {
      alert('최종 탐구 주제를 정해주세요!');
      return;
    }

    const data = {
      personalInterests,
      aiTopicRecommendations,
      selectedAITopic,
      myModifications,
      finalTopic,
      selectedCategory,
    };

    await onStepComplete(data, true);
  };

  return (
    <div className='space-y-6'>
      {/* 워크북 제목 */}
      <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg'>
        <div className='flex items-start gap-3'>
          <BookOpen className='text-blue-600 mt-1' size={20} />
          <div>
            <h3 className='font-semibold text-blue-900 mb-2'>
              ✅ 1단계: 탐구 주제 찾기
            </h3>
            <p className='text-blue-800 text-sm'>
              내가 좋아하거나 궁금한 것을 AI와 함께 찾아봐요! 관심 있는 걸
              이야기하면 AI가 과학 탐구 주제를 추천해줘요.
            </p>
          </div>
        </div>
      </div>

      {/* 1. 개인 관심사 */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          ☐ 평소 내가 궁금하게 생각하거나 관심을 가지고 있는 것을 떠올려 봅시다.
        </label>
        <div className='mb-2'>
          <button
            onClick={() => setShowInterestExamples(!showInterestExamples)}
            className='text-sm text-blue-600 hover:text-blue-700'
          >
            💡 관심사 예시 보기
          </button>
        </div>

        {showInterestExamples && (
          <div className='mb-3 p-3 bg-yellow-50 rounded-lg'>
            <div className='text-sm text-yellow-800'>
              <strong>예시:</strong> {interestExamples.join(', ')}
            </div>
          </div>
        )}

        <textarea
          value={personalInterests}
          onChange={(e) => setPersonalInterests(e.target.value)}
          placeholder='예: 동물, 요리, 운동, 음악 등 관심 있는 것들을 쉼표로 구분해서 적어보세요.'
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none'
        />
      </div>

      {/* 관심 분야 선택 */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-3'>
          관심 있는 과학 분야를 선택해보세요 (선택사항)
        </label>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() =>
                  setSelectedCategory(
                    category.id === selectedCategory ? '' : category.id
                  )
                }
                className={`p-3 rounded-lg border-2 transition-colors ${
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <IconComponent
                  size={24}
                  className='mx-auto mb-2 text-blue-600'
                />
                <div className='text-sm font-medium'>{category.name}</div>
                <div className='text-xs text-gray-500'>{category.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. AI 주제 추천 받기 */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          ☐ AI에게 주제 추천을 받아보세요.
        </label>

        <div className='bg-purple-50 p-4 rounded-lg'>
          <h4 className='font-medium text-purple-900 mb-3 flex items-center gap-2'>
            🤖 AI에게 물어보자!
          </h4>

          <div className='space-y-3'>
            <div className='text-sm text-purple-800 space-y-1'>
              <p>💬 나는 동물을 좋아해! 관련된 과학 탐구 주제를 3개 알려줘.</p>
              <p>💬 운동과 관련된 과학 주제도 있을까? 추천해줘.</p>
            </div>

            <button
              onClick={getAITopicRecommendations}
              disabled={isGettingRecommendations || !personalInterests.trim()}
              className='w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isGettingRecommendations
                ? '🤖 AI가 생각하는 중...'
                : '🤖 AI에게 주제 추천 받기'}
            </button>
          </div>
        </div>

        {aiTopicRecommendations && (
          <div className='mt-3 p-3 bg-white border border-purple-200 rounded-lg'>
            <h5 className='font-medium text-gray-900 mb-2'>
              ✅ AI가 추천한 주제
            </h5>
            <div className='text-sm text-gray-700 whitespace-pre-line'>
              {aiTopicRecommendations}
            </div>
          </div>
        )}
      </div>

      {/* 3. 추천받은 주제 선택 및 수정 */}
      {aiTopicRecommendations && (
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              ☐ 추천받은 주제 중 하나를 골라, 내 생각을 더 해 새로운 주제를
              만들어 봅시다.
            </label>

            <div className='space-y-3'>
              <div>
                <label className='block text-xs font-medium text-gray-600 mb-1'>
                  ✅ AI가 추천한 주제 중 마음에 드는 것
                </label>
                <textarea
                  value={selectedAITopic}
                  onChange={(e) => setSelectedAITopic(e.target.value)}
                  placeholder='AI가 추천한 주제 중 하나를 복사해서 붙여넣거나 직접 적어보세요.'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none text-sm'
                />
              </div>

              <div>
                <label className='block text-xs font-medium text-gray-600 mb-1'>
                  ✅ AI가 제안한 내용에 내가 바꾸거나 추가하고 싶은 점은?
                </label>
                <textarea
                  value={myModifications}
                  onChange={(e) => setMyModifications(e.target.value)}
                  placeholder='예: 더 구체적으로 만들고 싶어요, 다른 재료를 사용하고 싶어요, 실험 방법을 바꾸고 싶어요 등'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none text-sm'
                />
              </div>
            </div>
          </div>

          {/* 4. 최종 탐구 주제 */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              👉 <strong>나의 탐구주제</strong>
            </label>
            <textarea
              value={finalTopic}
              onChange={(e) => setFinalTopic(e.target.value)}
              placeholder='AI 추천과 내 아이디어를 합쳐서 최종 탐구 주제를 정해보세요.'
              className='w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none bg-blue-50'
            />
          </div>
        </div>
      )}

      {/* 예시 */}
      <div className='bg-yellow-50 p-4 rounded-lg'>
        <h4 className='font-medium text-yellow-900 mb-2 flex items-center gap-2'>
          <Lightbulb size={16} />
          워크북 예시
        </h4>
        <div className='text-sm text-yellow-800 space-y-1'>
          <p>
            <strong>관심사:</strong> 동물, 애완동물 키우기
          </p>
          <p>
            <strong>AI 추천:</strong> 반려동물의 먹이에 따른 활동량 변화 관찰
          </p>
          <p>
            <strong>내 수정:</strong> 우리 집 고양이로 실험하고, 간식 종류별로
            비교해보고 싶어요
          </p>
          <p>
            <strong>최종 주제:</strong> 고양이 간식의 종류가 놀이 활동에 미치는
            영향
          </p>
        </div>
      </div>

      {/* 버튼 */}
      <div className='flex gap-3 pt-4'>
        <button
          onClick={handleSave}
          className='flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors'
        >
          <Save size={16} />
          임시 저장
        </button>
        <button
          onClick={handleComplete}
          className='flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
        >
          다음 단계로 (2단계: 탐구 질문 만들기)
        </button>
      </div>
    </div>
  );
};
