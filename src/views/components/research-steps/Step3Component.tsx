import React from 'react';
import { FlaskConical, Plus, Trash2, Bot } from 'lucide-react';

interface Variables {
  controlled: string[];
  independent: string;
  dependent: string;
}

interface Step3LocalData {
  variables: Variables;
  materials: string[];
  safetyPrecautions: string[];
}

interface Step3ComponentProps {
  localData: Step3LocalData;
  onDataChange: (
    key: keyof Step3LocalData,
    value: Step3LocalData[keyof Step3LocalData] | Variables
  ) => void;
  onAddItem: (key: keyof Step3LocalData, defaultValue?: string) => void;
  onRemoveItem: (key: keyof Step3LocalData, index: number) => void;
  onUpdateItem: (
    key: keyof Step3LocalData,
    index: number,
    value: string
  ) => void;
  onAIHelp: (question: string, context?: Step3LocalData) => void;
}

const Step3Component: React.FC<Step3ComponentProps> = ({
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
      <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
        <div className='flex items-start space-x-3'>
          <FlaskConical className='w-6 h-6 text-green-500 flex-shrink-0 mt-1' />
          <div>
            <h3 className='font-bold text-lg mb-2 text-green-900'>
              🧪 실험 계획이란?
            </h3>
            <p className='text-green-800 leading-relaxed'>
              가설을 확인하기 위해 구체적인 실험 방법을 계획하는 거예요. 무엇을
              같게 하고, 무엇을 다르게 할지 정하는 것이 중요해요.
            </p>
          </div>
        </div>
      </div>

      {/* 변인 설정 */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='p-4 border border-gray-200 rounded-lg'>
          <h4 className='font-semibold text-green-600 mb-2'>
            같게 해야 할 것 (통제변인)
          </h4>
          <div className='space-y-2'>
            {(localData.variables?.controlled || ['']).map(
              (variable: string, index: number) => (
                <div key={index} className='flex items-center space-x-2'>
                  <input
                    type='text'
                    value={variable}
                    onChange={(e) => {
                      const newControlled = [
                        ...(localData.variables?.controlled || []),
                      ];
                      newControlled[index] = e.target.value;
                      onDataChange('variables', {
                        ...localData.variables,
                        controlled: newControlled,
                      });
                    }}
                    className='flex-1 p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    placeholder='통제할 조건'
                  />
                  {index > 0 && (
                    <button
                      onClick={() => {
                        const newControlled = (
                          localData.variables?.controlled || []
                        ).filter((_: string, i: number) => i !== index);
                        onDataChange('variables', {
                          ...localData.variables,
                          controlled: newControlled,
                        });
                      }}
                      className='p-1 text-red-500 hover:text-red-700'
                    >
                      <Trash2 className='w-3 h-3' />
                    </button>
                  )}
                </div>
              )
            )}
            <button
              onClick={() => {
                const newControlled = [
                  ...(localData.variables?.controlled || []),
                  '',
                ];
                onDataChange('variables', {
                  ...localData.variables,
                  controlled: newControlled,
                });
              }}
              className='text-xs text-green-600 hover:text-green-800 flex items-center space-x-1'
            >
              <Plus className='w-3 h-3' />
              <span>추가</span>
            </button>
          </div>
        </div>

        <div className='p-4 border border-gray-200 rounded-lg'>
          <h4 className='font-semibold text-blue-600 mb-2'>
            다르게 해야 할 것 (독립변인)
          </h4>
          <input
            type='text'
            value={localData.variables?.independent || ''}
            onChange={(e) =>
              onDataChange('variables', {
                ...localData.variables,
                independent: e.target.value,
              })
            }
            className='w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            placeholder='변화시킬 조건'
          />
        </div>

        <div className='p-4 border border-gray-200 rounded-lg'>
          <h4 className='font-semibold text-purple-600 mb-2'>
            관찰할 것 (종속변인)
          </h4>
          <input
            type='text'
            value={localData.variables?.dependent || ''}
            onChange={(e) =>
              onDataChange('variables', {
                ...localData.variables,
                dependent: e.target.value,
              })
            }
            className='w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
            placeholder='측정하거나 관찰할 것'
          />
        </div>
      </div>

      {/* 실험 재료 */}
      <div className='space-y-4'>
        <label className='block font-semibold text-gray-800'>
          필요한 준비물:
        </label>
        <div className='space-y-2'>
          {(localData.materials || ['']).map(
            (material: string, index: number) => (
              <div key={index} className='flex items-center space-x-2'>
                <input
                  type='text'
                  value={material}
                  onChange={(e) =>
                    onUpdateItem('materials', index, e.target.value)
                  }
                  className='flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder={`재료 ${
                    index + 1
                  }: 예) 콩나물, 화분, 색깔 있는 셀로판지`}
                />
                {index > 0 && (
                  <button
                    onClick={() => onRemoveItem('materials', index)}
                    className='p-2 text-red-500 hover:text-red-700 transition-colors mt-1'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                )}
              </div>
            )
          )}
          <button
            onClick={() => onAddItem('materials')}
            className='flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors'
          >
            <Plus className='w-4 h-4' />
            <span>재료 추가</span>
          </button>
        </div>
      </div>

      {/* 안전 주의사항 */}
      <div className='space-y-4'>
        <label className='block font-semibold text-gray-800'>
          안전 주의사항:
        </label>
        <div className='space-y-2'>
          {(localData.safetyPrecautions || ['']).map(
            (precaution: string, index: number) => (
              <div key={index} className='flex items-center space-x-2'>
                <input
                  type='text'
                  value={precaution}
                  onChange={(e) =>
                    onUpdateItem('safetyPrecautions', index, e.target.value)
                  }
                  className='flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder={`주의사항 ${
                    index + 1
                  }: 예) 실험 후에는 손을 깨끗이 씻기`}
                />
                {index > 0 && (
                  <button
                    onClick={() => onRemoveItem('safetyPrecautions', index)}
                    className='p-2 text-red-500 hover:text-red-700 transition-colors'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                )}
              </div>
            )
          )}
          <button
            onClick={() => onAddItem('safetyPrecautions')}
            className='flex items-center space-x-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors'
          >
            <Plus className='w-4 h-4' />
            <span>주의사항 추가</span>
          </button>
        </div>
      </div>

      {/* AI 도움 버튼 */}
      <button
        onClick={() =>
          onAIHelp('실험 계획에 대한 피드백을 받고 싶어요', localData)
        }
        className='w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2'
      >
        <Bot className='w-5 h-5' />
        <span>AI에게 실험 계획 검토받기</span>
      </button>
    </div>
  );
};

export default Step3Component;
