import React from 'react';
import { BarChart3, Bot, Circle, Triangle, X } from 'lucide-react';
import ChartGenerator from '../ChartGenerator';
import type { ChartData } from '../../../models/types';

export interface Step4LocalData {
  experimentResults: string;
  chartData?: ChartData;
  hypothesisResult: string;
  hypothesisExplanation: string;
  conclusion: string;
}

interface Step4ComponentProps {
  localData: Step4LocalData;
  onDataChange: (
    key: keyof Step4LocalData,
    value: Step4LocalData[keyof Step4LocalData]
  ) => void;
  onAIHelp: (question: string, context?: Step4LocalData) => void;
  isAIRequesting: boolean;
}

const Step4Component: React.FC<Step4ComponentProps> = ({
  localData,
  onDataChange,
  onAIHelp,
  isAIRequesting,
}) => {
  return (
    <div className='space-y-6'>
      {/* 단계 설명 */}
      <div className='bg-purple-50 p-4 rounded-lg border border-purple-200'>
        <div className='flex items-start space-x-3'>
          <BarChart3 className='w-6 h-6 text-purple-500 flex-shrink-0 mt-1' />
          <div>
            <h3 className='font-bold text-lg mb-2 text-purple-900'>
              📊 결과 정리와 결론이란?
            </h3>
            <p className='text-purple-800 leading-relaxed'>
              실험에서 얻은 데이터를 정리하고, 패턴을 찾아 결론을 내리는
              단계예요. 표나 그래프를 만들면 결과를 더 쉽게 이해할 수 있어요.
            </p>
          </div>
        </div>
      </div>

      {/* 실험 결과 */}
      <div className='space-y-4'>
        <label className='block font-semibold text-gray-800'>
          실험 결과를 기록해보세요:
        </label>
        <textarea
          value={localData.experimentResults || ''}
          onChange={(e) => onDataChange('experimentResults', e.target.value)}
          className='w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          placeholder='관찰한 내용과 측정한 데이터를 자세히 기록하세요'
        />
      </div>

      {/* 차트 생성 */}
      <div className='space-y-4'>
        <label className='block font-semibold text-gray-800'>
          데이터 시각화:
        </label>
        <ChartGenerator
          onChartCreate={(chartData) => {
            onDataChange('chartData', chartData);
          }}
          existingData={localData.chartData}
        />
      </div>

      {/* 가설 검증 */}
      <div className='space-y-4'>
        <div className='flex items-center space-x-4'>
          <label className='block font-semibold text-gray-800'>
            가설 검증 결과:
          </label>
          <div className='flex space-x-4'>
            {['맞았다', '부분적으로 맞았다', '틀렸다'].map((option) => (
              <label
                key={option}
                className={`
                  flex items-center justify-center px-4 py-2 rounded-lg cursor-pointer transition-all duration-200
                  ${
                    localData.hypothesisResult === option
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                  md:space-x-2
                `}
              >
                <input
                  type='radio'
                  name='hypothesisResult'
                  value={option}
                  checked={localData.hypothesisResult === option}
                  onChange={(e) =>
                    onDataChange('hypothesisResult', e.target.value)
                  }
                  className='hidden'
                />
                <span className='text-sm hidden md:inline'>{option}</span>
                <span className='text-sm md:hidden'>
                  {option === '맞았다' ? (
                    <Circle className='w-5 h-5' />
                  ) : option === '부분적으로 맞았다' ? (
                    <Triangle className='w-5 h-5' />
                  ) : (
                    <X className='w-5 h-5' />
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>

        <textarea
          value={localData.hypothesisExplanation || ''}
          onChange={(e) =>
            onDataChange('hypothesisExplanation', e.target.value)
          }
          className='w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          placeholder='가설과 실험 결과를 비교하여 설명해보세요'
        />
      </div>

      {/* 최종 결론 */}
      <div className='space-y-2'>
        <label className='block font-semibold text-gray-800'>최종 결론:</label>
        <textarea
          value={localData.conclusion || ''}
          onChange={(e) => onDataChange('conclusion', e.target.value)}
          className='w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          placeholder='실험을 통해 알게 된 사실을 정리해보세요'
        />
      </div>

      {/* AI 도움 버튼 */}
      <button
        disabled={isAIRequesting}
        onClick={() => onAIHelp('실험 결과 분석에 도움이 필요해요', localData)}
        className='w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2'
      >
        <Bot className='w-5 h-5' />
        <span>
          {isAIRequesting ? 'AI 응답 대기 중...' : 'AI에게 결과 분석 도움받기'}
        </span>
      </button>
    </div>
  );
};

export default Step4Component;
