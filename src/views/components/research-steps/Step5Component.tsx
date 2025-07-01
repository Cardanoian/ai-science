import React, { useState, useEffect } from 'react';
import { Presentation, Bot, Download, Sparkles, Eye } from 'lucide-react';

interface Step5LocalData {
  presentationTitle?: string;
  presentationSlides?: { [key: string]: string };
  presentationScript?: string;
  generatedPresentationHtml?: string;
}

interface Step5ComponentProps {
  localData: Step5LocalData;
  onDataChange: (
    key: keyof Step5LocalData,
    value: Step5LocalData[keyof Step5LocalData]
  ) => void;
  onAIHelp: (question: string, context?: Step5LocalData) => void;
  onGeneratePresentation: () => void;
  onViewPresentation: () => void;
  isAIRequesting: boolean;
}

const Step5Component: React.FC<Step5ComponentProps> = ({
  localData,
  onDataChange,
  onAIHelp,
  onGeneratePresentation,
  onViewPresentation,
  isAIRequesting,
}) => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isMobile = screenWidth < 768; // TailwindCSS 'md' breakpoint is 768px

  return (
    <div className='space-y-6'>
      {/* 단계 설명 */}
      <div className='bg-orange-50 p-4 rounded-lg border border-orange-200'>
        <div className='flex items-start space-x-3'>
          <Presentation className='w-6 h-6 text-orange-500 flex-shrink-0 mt-1' />
          <div>
            <h3 className='font-bold text-lg mb-2 text-orange-900'>
              🎤 발표 준비란?
            </h3>
            <p className='text-orange-800 leading-relaxed'>
              탐구한 내용을 친구들에게 쉽게 설명할 수 있도록 발표 자료와 대본을
              준비하는 거예요. 그림과 사진을 함께 사용하면 더 이해하기 쉬워요.
            </p>
          </div>
        </div>
      </div>

      {/* 발표 제목 */}
      <div className='space-y-2'>
        <label className='block font-semibold text-gray-800'>발표 제목:</label>
        <input
          type='text'
          value={localData.presentationTitle || ''}
          onChange={(e) => onDataChange('presentationTitle', e.target.value)}
          className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          placeholder='흥미로운 발표 제목을 지어보세요'
        />
      </div>

      {/* 발표 구성 */}
      <div className='space-y-4'>
        <label className='block font-semibold text-gray-800'>
          발표 구성 (각 부분을 완성해보세요):
        </label>

        <div className='space-y-4'>
          {[
            {
              title: '1. 인사 및 주제 소개',
              key: 'intro',
              placeholder: '안녕하세요! 오늘은 ... 에 대해 발표하겠습니다.',
            },
            {
              title: '2. 탐구 동기',
              key: 'motivation',
              placeholder: '이 주제를 선택한 이유는...',
            },
            {
              title: '3. 탐구 질문과 가설',
              key: 'questionHypothesis',
              placeholder: '저의 탐구 질문은... 가설은...',
            },
            {
              title: '4. 실험 방법',
              key: 'method',
              placeholder: '실험을 위해 준비한 것들과 실험 순서는...',
            },
            {
              title: '5. 실험 결과',
              key: 'results',
              placeholder: '실험 결과, 다음과 같은 것을 발견했습니다...',
            },
            {
              title: '6. 결론 및 느낀점',
              key: 'conclusion',
              placeholder: '결론적으로... 이번 탐구를 통해 배운 점은...',
            },
          ].map((section, index) => (
            <div key={index} className='p-4 border border-gray-200 rounded-lg'>
              <h5 className='font-medium text-orange-600 mb-2'>
                {section.title}
              </h5>
              <textarea
                value={localData.presentationSlides?.[section.key] || ''}
                onChange={(e) =>
                  onDataChange('presentationSlides', {
                    ...localData.presentationSlides,
                    [section.key]: e.target.value,
                  })
                }
                className='w-full p-3 border border-gray-300 rounded h-20 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                placeholder={section.placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 발표 팁 */}
      <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
        <h5 className='font-medium mb-2 text-blue-800'>🤖 AI 발표 코칭</h5>
        <div className='text-sm text-blue-700 space-y-1'>
          <p>
            <strong>발표 팁:</strong>
          </p>
          <ul className='list-disc list-inside space-y-1 ml-2'>
            <li>친구들과 눈을 마주치며 이야기하세요</li>
            <li>중요한 부분은 천천히, 명확하게 말하세요</li>
            <li>그림이나 실물을 보여주면서 설명하세요</li>
            <li>질문이 있는지 중간중간 확인해보세요</li>
          </ul>
        </div>
      </div>

      {/* 발표 자료 생성/보기 버튼 */}
      <div className='flex space-x-3'>
        <button
          onClick={onGeneratePresentation}
          className='flex-1 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2'
        >
          <Sparkles className='w-5 h-5' />
          <span>{isMobile ? '자료 만들기' : '발표자료 만들기'}</span>
        </button>
        <button
          onClick={onViewPresentation}
          disabled={!localData.generatedPresentationHtml} // HTML이 있을 때만 활성화
          className='flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <Eye className='w-5 h-5' />
          <span>{isMobile ? '자료 보기' : '발표자료 보기'}</span>
        </button>
      </div>

      {/* 발표 대본 */}
      <div className='space-y-2'>
        <label className='block font-semibold text-gray-800'>
          발표 대본 (선택사항):
        </label>
        <textarea
          value={localData.presentationScript || ''}
          onChange={(e) => onDataChange('presentationScript', e.target.value)}
          className='w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          placeholder='발표할 내용을 대본으로 정리해보세요'
        />
      </div>

      {/* AI 도움 버튼 */}
      <div className='flex space-x-3'>
        <button
          disabled={isAIRequesting}
          onClick={() =>
            onAIHelp('발표 대본을 더 좋게 만들고 싶어요', localData)
          }
          className='flex-1 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2'
        >
          <Bot className='w-5 h-5' />
          <span>
            {isAIRequesting
              ? isMobile
                ? '응답 중'
                : 'AI 응답 대기 중...'
              : isMobile
              ? 'AI 코칭'
              : 'AI 발표 코칭 받기'}
          </span>
        </button>
        <button
          onClick={() => {
            // 발표 자료 다운로드 로직
            const presentationData = {
              title: localData.presentationTitle || '나의 탐구 발표',
              slides: localData.presentationSlides || {},
              script: localData.presentationScript || '',
              generatedHtml: localData.generatedPresentationHtml || '',
            };

            const blob = new Blob([JSON.stringify(presentationData, null, 2)], {
              type: 'application/json',
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${presentationData.title}_발표자료.json`;
            link.click();

            URL.revokeObjectURL(url);
          }}
          className='px-4 py-3 bg-orange-500 flex-1 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2'
        >
          <Download className='w-4 h-4' />
          <span>{isMobile ? '자료 받기' : '발표 자료 다운로드'}</span>
        </button>
      </div>
    </div>
  );
};

export default Step5Component;
