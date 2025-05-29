// src/components/research-steps/Step2Component.tsx
import React from 'react';
import { Lightbulb, Plus, Trash2, Bot } from 'lucide-react';

type Step2LocalData = {
  observations?: string[];
  researchQuestion?: string;
  hypothesis?: {
    condition?: string;
    prediction?: string;
  };
  hypothesisReason?: string;
};

interface Step2ComponentProps {
  localData: Step2LocalData;
  onDataChange: (key: string, value: unknown) => void;
  onAddItem: (key: string, defaultValue?: string) => void;
  onRemoveItem: (key: string, index: number) => void;
  onUpdateItem: (key: string, index: number, value: unknown) => void;
  onAIHelp: (question: string, context?: Step2LocalData) => void;
}

const Step2Component: React.FC<Step2ComponentProps> = ({
  localData,
  onDataChange,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onAIHelp,
}) => {
  return (
    <div className='space-y-6'>
      {/* 단계 설명 */}
      <div className='bg-yellow-50 p-4 rounded-lg border border-yellow-200'>
        <div className='flex items-start space-x-3'>
          <Lightbulb className='w-6 h-6 text-yellow-500 flex-shrink-0 mt-1' />
          <div>
            <h3 className='font-bold text-lg mb-2 text-yellow-900'>
              💡 탐구 질문과 가설이란?
            </h3>
            <div className='text-yellow-800 space-y-2'>
              <p>
                <strong>탐구 질문:</strong> 실험으로 답할 수 있는 구체적인
                질문이에요. "왜?", "어떻게?", "무엇이?" 등으로 시작해요.
              </p>
              <p>
                <strong>가설:</strong> 실험 결과를 미리 예상해보는 것이에요.
                "만약 ~라면, ~일 것이다"라는 형태로 쓰면 좋아요.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 관찰 사항 */}
      <div className='space-y-4'>
        <label className='block font-semibold text-gray-800'>
          주제와 관련해서 관찰한 것들:
        </label>
        <div className='space-y-2'>
          {(localData.observations || ['']).map(
            (observation: string, index: number) => (
              <div key={index} className='flex items-center space-x-2'>
                <input
                  type='text'
                  value={observation}
                  onChange={(e) =>
                    onUpdateItem('observations', index, e.target.value)
                  }
                  className='flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder={`관찰 ${
                    index + 1
                  }: 예) 햇빛이 잘 드는 곳의 식물이 더 잘 자란다`}
                />
                {index > 0 && (
                  <button
                    onClick={() => onRemoveItem('observations', index)}
                    className='p-2 text-red-500 hover:text-red-700 transition-colors'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                )}
              </div>
            )
          )}
          <button
            onClick={() => onAddItem('observations')}
            className='flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors'
          >
            <Plus className='w-4 h-4' />
            <span>관찰 추가</span>
          </button>
        </div>
      </div>

      {/* 탐구 질문 */}
      <div className='space-y-2'>
        <label className='block font-semibold text-gray-800'>탐구 질문:</label>
        <input
          type='text'
          value={localData.researchQuestion || ''}
          onChange={(e) => onDataChange('researchQuestion', e.target.value)}
          className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          placeholder='예: 햇빛의 색깔에 따라 식물의 성장 속도가 달라질까?'
        />
      </div>

      {/* 가설 */}
      <div className='space-y-2'>
        <label className='block font-semibold text-gray-800'>가설:</label>
        <div className='flex items-center space-x-2'>
          <span className='text-gray-600 font-medium'>만약</span>
          <input
            type='text'
            value={localData.hypothesis?.condition || ''}
            onChange={(e) =>
              onDataChange('hypothesis', {
                ...localData.hypothesis,
                condition: e.target.value,
              })
            }
            className='flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            placeholder='조건을 입력하세요'
          />
          <span className='text-gray-600 font-medium'>라면,</span>
          <input
            type='text'
            value={localData.hypothesis?.prediction || ''}
            onChange={(e) =>
              onDataChange('hypothesis', {
                ...localData.hypothesis,
                prediction: e.target.value,
              })
            }
            className='flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            placeholder='예상 결과를 입력하세요'
          />
          <span className='text-gray-600 font-medium'>일 것이다.</span>
        </div>
      </div>

      {/* 가설 이유 */}
      <div className='space-y-2'>
        <label className='block font-semibold text-gray-800'>
          왜 그렇게 생각했나요?
        </label>
        <textarea
          value={localData.hypothesisReason || ''}
          onChange={(e) => onDataChange('hypothesisReason', e.target.value)}
          className='w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          placeholder='가설을 세운 이유를 써보세요'
        />
      </div>

      {/* AI 도움 버튼 */}
      <button
        onClick={() =>
          onAIHelp('탐구 질문과 가설에 대한 피드백을 받고 싶어요', localData)
        }
        className='w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2'
      >
        <Bot className='w-5 h-5' />
        <span>AI에게 질문과 가설 검토받기</span>
      </button>
    </div>
  );
};

export default Step2Component;
