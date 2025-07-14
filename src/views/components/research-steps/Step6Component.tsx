import React from 'react';
import { Heart, Bot, Save } from 'lucide-react';

interface AIExperience {
  positive: string;
  improvement: string;
}

interface Step6LocalData {
  whatLearned: string;
  challenges: string;
  newLearnings: string;
  nextResearch: string;
  aiExperience: AIExperience;
}

interface Step6ComponentProps {
  localData: Step6LocalData;
  onDataChange: (
    key: keyof Step6LocalData,
    value: string | AIExperience
  ) => void;
  onAIHelp: (question: string, context?: Step6LocalData) => void;
  onSave: (data: Step6LocalData, completed?: boolean) => void;
  isAIRequesting: boolean;
  isTutorial?: boolean;
}

const Step6Component: React.FC<Step6ComponentProps> = ({
  localData,
  onDataChange,
  onAIHelp,
  onSave,
  isAIRequesting,
  isTutorial,
}) => {
  return (
    <div className='space-y-6'>
      {/* 단계 설명 */}
      <div className='bg-pink-50 p-4 rounded-lg border border-pink-200'>
        <div className='flex items-start space-x-3'>
          <Heart className='w-6 h-6 text-pink-500 flex-shrink-0 mt-1' />
          <div>
            <h3 className='font-bold text-lg mb-2 text-pink-900'>
              💖 성찰이란?
            </h3>
            <p className='text-pink-800 leading-relaxed'>
              탐구 과정을 돌아보며 무엇을 배웠는지, 어떤 점이 어려웠는지,
              다음에는 무엇을 더 해보고 싶은지 생각해보는 시간이에요.
            </p>
          </div>
        </div>
      </div>

      {/* 잘한 점 */}
      <div className='space-y-2'>
        <label className='block font-semibold text-gray-800'>
          🎉 내가 잘한 점:
        </label>
        <textarea
          value={localData.whatLearned || ''}
          onChange={(e) => onDataChange('whatLearned', e.target.value)}
          className='w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          placeholder='이번 탐구에서 스스로 칭찬하고 싶은 점을 써보세요'
        />
      </div>

      {/* 어려웠던 점 */}
      <div className='space-y-2'>
        <label className='block font-semibold text-gray-800'>
          😅 어려웠던 점:
        </label>
        <textarea
          value={localData.challenges || ''}
          onChange={(e) => onDataChange('challenges', e.target.value)}
          className='w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          placeholder='탐구하면서 힘들거나 아쉬웠던 점을 써보세요'
        />
      </div>

      {/* 새롭게 알게 된 점 */}
      <div className='space-y-2'>
        <label className='block font-semibold text-gray-800'>
          🧠 새롭게 알게 된 점:
        </label>
        <textarea
          value={localData.newLearnings || ''}
          onChange={(e) => onDataChange('newLearnings', e.target.value)}
          className='w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          placeholder='이번 탐구를 통해 새롭게 배운 과학 지식이나 방법을 써보세요'
        />
      </div>

      {/* 다음 탐구 계획 */}
      <div className='space-y-2'>
        <label className='block font-semibold text-gray-800'>
          🔍 다음에 더 탐구하고 싶은 것:
        </label>
        <textarea
          value={localData.nextResearch || ''}
          onChange={(e) => onDataChange('nextResearch', e.target.value)}
          className='w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          placeholder='이번 탐구에서 새롭게 궁금해진 것이나 더 해보고 싶은 실험을 써보세요'
        />
      </div>

      {/* AI와 함께한 경험 */}
      <div className='space-y-4'>
        <label className='block font-semibold text-gray-800'>
          🤖 AI와 함께한 경험:
        </label>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='font-medium text-green-600 text-sm'>
              좋았던 점:
            </label>
            <textarea
              value={localData.aiExperience?.positive || ''}
              onChange={(e) =>
                onDataChange('aiExperience', {
                  ...localData.aiExperience,
                  positive: e.target.value,
                })
              }
              className='w-full p-3 border border-gray-300 rounded-lg h-20 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500'
              placeholder='AI의 도움 중 좋았던 점을 써보세요'
            />
          </div>
          <div>
            <label className='font-medium text-blue-600 text-sm'>
              더 잘 활용하려면:
            </label>
            <textarea
              value={localData.aiExperience?.improvement || ''}
              onChange={(e) =>
                onDataChange('aiExperience', {
                  ...localData.aiExperience,
                  improvement: e.target.value,
                })
              }
              className='w-full p-3 border border-gray-300 rounded-lg h-20 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='다음에 AI를 더 잘 활용하는 방법을 생각해보세요'
            />
          </div>
        </div>
      </div>

      {/* 탐구 완료 축하 */}
      <div className='p-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg text-center border border-purple-200'>
        <h3 className='font-bold text-lg text-purple-800 mb-2'>
          🎊 탐구 완료를 축하합니다!
        </h3>
        <p className='text-purple-700 mb-4'>
          여러분은 진짜 과학자처럼 탐구를 완성했어요. 앞으로도 궁금한 것들을
          과학적으로 탐구해보세요!
        </p>
        <div className='flex justify-center space-x-3'>
          <button
            onClick={() => !isTutorial && onSave(localData, true)}
            disabled={isTutorial}
            className='px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <Save className='w-4 h-4' />
            <span>탐구 완료로 저장</span>
          </button>
        </div>
      </div>

      {/* AI 도움 버튼 */}
      <button
        disabled={isAIRequesting || isTutorial}
        onClick={() =>
          !isTutorial &&
          onAIHelp('탐구 과정을 돌아보며 성찰해보고 싶어요', localData)
        }
        className={`w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2 ${
          isAIRequesting || isTutorial ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Bot className='w-5 h-5' />
        <span>
          {isAIRequesting ? 'AI 응답 대기 중...' : 'AI와 함께 성찰하기'}
        </span>
      </button>
    </div>
  );
};

export default Step6Component;
