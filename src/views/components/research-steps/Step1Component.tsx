import React, { useState } from 'react';
import { Search, Plus, Trash2, Sparkles, Bot } from 'lucide-react';
import type { ResearchController } from '../../../controllers/ResearchController';

interface Step1LocalData {
  interests: string[];
  selectedTopic?: string;
  topicReason?: string;
  [key: string]: string | string[] | undefined;
}

interface Step1ComponentProps {
  localData: Step1LocalData;
  onDataChange: (key: string, value: string) => void;
  onAddItem: (key: string, defaultValue?: string) => void;
  onRemoveItem: (key: string, index: number) => void;
  onUpdateItem: (key: string, index: number, value: string) => void;
  onAIHelp: (question: string, context?: Step1LocalData) => void;
  researchController: ResearchController;
}

const Step1Component: React.FC<Step1ComponentProps> = ({
  localData,
  onDataChange,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onAIHelp,
  researchController,
}) => {
  const [showTopicRecommendations, setShowTopicRecommendations] =
    useState(false);
  interface AiTopic {
    title: string;
    description: string;
    difficulty: string;
    materials?: string[];
  }

  const [aiTopics, setAiTopics] = useState<AiTopic[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);

  // AI 주제 추천 요청
  const handleGetTopicRecommendations = async () => {
    try {
      setIsLoadingTopics(true);
      const interests = localData.interests || [];
      const topics = await researchController.getTopicRecommendations(
        interests
      );
      setAiTopics(topics);
      setShowTopicRecommendations(true);
    } catch (error) {
      console.error('Failed to get topic recommendations:', error);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* 단계 설명 */}
      <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
        <div className='flex items-start space-x-3'>
          <Search className='w-6 h-6 text-blue-500 flex-shrink-0 mt-1' />
          <div>
            <h3 className='font-bold text-lg mb-2 text-blue-900'>
              🔍 탐구 주제란?
            </h3>
            <p className='text-blue-800 leading-relaxed'>
              탐구 주제는 여러분이 궁금해하는 자연 현상이나 과학적 문제예요.
              관찰 가능하고 실험으로 확인할 수 있는 것을 선택하는 것이 좋아요.
            </p>
          </div>
        </div>
      </div>

      {/* 관심사 입력 */}
      <div className='space-y-4'>
        <label className='block font-semibold text-gray-800'>
          평소 궁금했던 것들을 써보세요:
        </label>
        <div className='space-y-2'>
          {(localData.interests || ['']).map(
            (interest: string, index: number) => (
              <div key={index} className='flex items-center space-x-2'>
                <input
                  type='text'
                  value={interest}
                  onChange={(e) =>
                    onUpdateItem('interests', index, e.target.value)
                  }
                  className='flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder={`관심사 ${
                    index + 1
                  }: 예) 식물이 색깔 있는 빛에서도 잘 자랄까?`}
                />
                {index > 0 && (
                  <button
                    onClick={() => onRemoveItem('interests', index)}
                    className='p-2 text-red-500 hover:text-red-700 transition-colors'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                )}
              </div>
            )
          )}
          <button
            onClick={() => onAddItem('interests')}
            className='flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors'
          >
            <Plus className='w-4 h-4' />
            <span>관심사 추가</span>
          </button>
        </div>
      </div>

      {/* AI 주제 추천 */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h4 className='font-semibold text-gray-800'>🤖 AI 추천 주제</h4>
          <button
            onClick={handleGetTopicRecommendations}
            disabled={isLoadingTopics}
            className='px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50'
          >
            <Sparkles className='w-4 h-4' />
            <span>{isLoadingTopics ? '추천 중...' : '주제 추천받기'}</span>
          </button>
        </div>

        {showTopicRecommendations && aiTopics.length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {aiTopics.map((topic, index) => (
              <div
                key={index}
                className='p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors'
                onClick={() => onDataChange('selectedTopic', topic.title)}
              >
                <h5 className='font-semibold text-blue-600 mb-2'>
                  {topic.title}
                </h5>
                <p className='text-sm text-gray-600 mb-3'>
                  {topic.description}
                </p>
                <div className='flex items-center justify-between'>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      topic.difficulty === '쉬움'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {topic.difficulty}
                  </span>
                  <div className='flex flex-wrap gap-1'>
                    {topic.materials
                      ?.slice(0, 2)
                      .map((material: string, i: number) => (
                        <span
                          key={i}
                          className='text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded'
                        >
                          {material}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 최종 탐구 주제 */}
      <div className='space-y-2'>
        <label className='block font-semibold text-gray-800'>
          최종 탐구 주제:
        </label>
        <input
          type='text'
          value={localData.selectedTopic || ''}
          onChange={(e) => onDataChange('selectedTopic', e.target.value)}
          className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          placeholder='선택한 주제를 입력하세요'
        />
      </div>

      {/* 주제 선택 이유 */}
      <div className='space-y-2'>
        <label className='block font-semibold text-gray-800'>
          이 주제를 선택한 이유:
        </label>
        <textarea
          value={localData.topicReason || ''}
          onChange={(e) => onDataChange('topicReason', e.target.value)}
          className='w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          placeholder='왜 이 주제에 관심을 갖게 되었는지 설명해보세요'
        />
      </div>

      {/* AI 도움 버튼 */}
      <button
        onClick={() =>
          onAIHelp('주제 선택에 대한 피드백을 받고 싶어요', localData)
        }
        className='w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2'
      >
        <Bot className='w-5 h-5' />
        <span>AI에게 주제 피드백 받기</span>
      </button>
    </div>
  );
};

export default Step1Component;
