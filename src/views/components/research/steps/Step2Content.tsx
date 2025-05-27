import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Target,
  Save,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import { ResearchController } from '../../../../controllers/ResearchController';
import { GeminiAIService } from '../../../../services/GeminiAIService';

interface Step2ContentProps {
  projectId: string;
  controller: ResearchController;
  onStepComplete: (data: any, completed?: boolean) => Promise<void>;
  stepInfo: any;
}

export const Step2Content: React.FC<Step2ContentProps> = ({
  projectId,
  controller,
  onStepComplete,
  stepInfo,
}) => {
  const [geminiService] = useState(() => new GeminiAIService());

  // 워크북 항목들
  const [curiosity, setCuriosity] = useState('');
  const [aiQuestionSuggestions, setAiQuestionSuggestions] = useState('');
  const [finalQuestion, setFinalQuestion] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [hypothesisReason, setHypothesisReason] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [finalHypothesis, setFinalHypothesis] = useState('');

  // AI 상호작용
  const [currentAIQuestion, setCurrentAIQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [qaHistory, setQaHistory] = useState<any[]>([]);

  useEffect(() => {
    loadQAHistory();
  }, [projectId]);

  const loadQAHistory = async () => {
    try {
      const history = await controller.researchModel.getQAHistory(projectId, 2);
      setQaHistory(history);
    } catch (error) {
      console.error('Error loading Q&A history:', error);
    }
  };

  const getAIQuestionSuggestions = async () => {
    if (!curiosity.trim()) {
      alert('먼저 궁금한 점을 적어주세요!');
      return;
    }

    setIsLoadingAI(true);
    try {
      const response = await geminiService.askQuestion(
        `내 탐구 주제와 관련된 탐구 질문 3개를 만들어줘. 주제: ${curiosity}`,
        '탐구 질문 만들기'
      );

      if (response.success) {
        setAiQuestionSuggestions(response.message);
      } else {
        alert('질문 제안을 받는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error getting AI question suggestions:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getHypothesisFeedback = async () => {
    if (!hypothesis.trim()) {
      alert('먼저 가설을 적어주세요!');
      return;
    }

    setIsLoadingAI(true);
    try {
      const response = await geminiService.provideFeedback({
        question: finalQuestion,
        hypothesis: hypothesis,
        experimentPlan: '',
        step: 2,
      });

      if (response.success) {
        setAiFeedback(response.message);
      } else {
        alert('피드백을 받는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error getting hypothesis feedback:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const askAIQuestion = async () => {
    if (!currentAIQuestion.trim()) return;

    setIsLoadingAI(true);
    try {
      const response = await geminiService.askQuestion(
        currentAIQuestion,
        '2단계 탐구 질문 만들기'
      );

      if (response.success) {
        // Q&A 저장
        await controller.researchModel.createQA(
          projectId,
          2,
          currentAIQuestion,
          '',
          response.message
        );

        setAiResponse(response.message);
        setCurrentAIQuestion('');
        await loadQAHistory();
      }
    } catch (error) {
      console.error('Error asking AI:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSave = async () => {
    const data = {
      curiosity,
      aiQuestionSuggestions,
      finalQuestion,
      hypothesis,
      hypothesisReason,
      aiFeedback,
      finalHypothesis,
    };

    await onStepComplete(data, false);
  };

  const handleComplete = async () => {
    if (!finalQuestion.trim() || !finalHypothesis.trim()) {
      alert('탐구 질문과 최종 가설을 모두 입력해주세요.');
      return;
    }

    const data = {
      curiosity,
      aiQuestionSuggestions,
      finalQuestion,
      hypothesis,
      hypothesisReason,
      aiFeedback,
      finalHypothesis,
    };

    await onStepComplete(data, true);
  };

  return (
    <div className='space-y-6'>
      {/* 워크북 제목 */}
      <div className='bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg'>
        <div className='flex items-start gap-3'>
          <Target className='text-green-600 mt-1' size={20} />
          <div>
            <h3 className='font-semibold text-green-900 mb-2'>
              ✅ 2단계: 탐구 질문 만들기와 가설 세우기
            </h3>
            <p className='text-green-800 text-sm'>
              내가 정한 탐구 주제를 더 깊이 탐구하기 위해 탐구 질문을 만들고,
              가설도 세워봅시다.
            </p>
          </div>
        </div>
      </div>

      {/* 1. 궁금한 점 생각하기 */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          ☐ 내가 선택한 탐구 주제와 관련해 궁금한 점을 생각해 봅시다.
        </label>
        <textarea
          value={curiosity}
          onChange={(e) => setCuriosity(e.target.value)}
          placeholder='예: 초콜릿을 어떤 조건에서 놓으면 더 빨리 녹을까? 식물이 어떤 환경에서 더 잘 자랄까?'
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none'
        />
      </div>

      {/* 2. AI와 함께 질문 만들기 */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          ☐ AI와 함께 다양한 질문을 만들어 보고, 마음에 드는 질문을 골라봅시다.
        </label>

        <div className='bg-purple-50 p-4 rounded-lg'>
          <h4 className='font-medium text-purple-900 mb-3 flex items-center gap-2'>
            🤖 AI에게 물어보자!
          </h4>

          <div className='space-y-3'>
            <div className='text-sm text-purple-800 space-y-1'>
              <p>
                💬 내 탐구 주제는 [초콜릿이 녹는 속도]야. 이와 관련된 탐구 질문
                3개만 만들어줘.
              </p>
              <p>💬 이 주제로 탐구할 만한 질문을 추천해줘</p>
            </div>

            <button
              onClick={getAIQuestionSuggestions}
              disabled={isLoadingAI || !curiosity.trim()}
              className='w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors'
            >
              {isLoadingAI
                ? '🤖 AI가 질문을 만드는 중...'
                : '🤖 AI에게 질문 제안 받기'}
            </button>
          </div>

          {aiQuestionSuggestions && (
            <div className='mt-3 p-3 bg-white border border-purple-200 rounded-lg'>
              <h5 className='font-medium text-gray-900 mb-2'>
                AI가 제안한 질문들
              </h5>
              <div className='text-sm text-gray-700 whitespace-pre-line'>
                {aiQuestionSuggestions}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. 최종 탐구 질문 정하기 */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          ☐ 내가 생각한 질문과 AI가 제안한 질문을 바탕으로 '최종 탐구 질문'을
          정해 봅시다.
        </label>
        <textarea
          value={finalQuestion}
          onChange={(e) => setFinalQuestion(e.target.value)}
          placeholder='구체적이고 실험으로 확인할 수 있는 질문을 만들어보세요.'
          className='w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-16 resize-none bg-green-50'
        />
      </div>

      {/* 가설 설명 */}
      <div className='bg-blue-50 p-4 rounded-lg'>
        <h4 className='font-medium text-blue-900 mb-2'>💬 가설이란?</h4>
        <div className='text-sm text-blue-800 space-y-2'>
          <p>
            가설은 탐구 해야 할 문제에 대한 잠정적인 해답, 즉 탐구 결과를 미리{' '}
            <strong>예상</strong>하는것이예요. 가설은 자연 현상이나 사물을
            관찰하고 의문을 갖는과정에서 세워지며, 실험이나 탐구를 통해
            검증된답니다.
          </p>
          <p>아래와 같은 틀로 쉽게 쓸 수 있어요:</p>
          <p className='font-medium'>
            👉 <strong>"만약 ~라면, ~일 것이다."</strong>
          </p>
        </div>
      </div>

      {/* 가설 예시 테이블 */}
      <div className='bg-yellow-50 p-4 rounded-lg'>
        <h4 className='font-medium text-yellow-900 mb-3'>💡 가설 예시</h4>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm border-collapse border border-yellow-300'>
            <thead>
              <tr className='bg-yellow-200'>
                <th className='border border-yellow-300 p-2 text-left font-medium'>
                  탐구 질문
                </th>
                <th className='border border-yellow-300 p-2 text-left font-medium'>
                  가설 예시
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='border border-yellow-300 p-2'>
                  햇빛이 식물 성장에 영향을 줄까?
                </td>
                <td className='border border-yellow-300 p-2'>
                  만약 식물이 햇빛을 많이 받는다면, 더 빨리 자랄 것이다.
                </td>
              </tr>
              <tr>
                <td className='border border-yellow-300 p-2'>
                  색깔에 따라 얼음이 녹는 속도가 다를까?
                </td>
                <td className='border border-yellow-300 p-2'>
                  만약, 검은색 종이에 놓인 얼음이라면, 더 빨리 녹을 것이다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. 나만의 가설 세우기 */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          ☐ 나만의 가설을 세워 봅시다.
        </label>

        <div className='space-y-3'>
          <div className='bg-blue-50 p-3 rounded-lg'>
            <div className='flex items-center gap-2 text-blue-900 font-medium mb-2'>
              가설 작성하기
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <span className='text-blue-800'>만약</span>
              <input
                type='text'
                value={hypothesis.split(',')[0] || ''}
                onChange={(e) => {
                  const parts = hypothesis.split(',');
                  parts[0] = e.target.value;
                  setHypothesis(parts.join(','));
                }}
                placeholder='조건을 입력하세요'
                className='flex-1 px-2 py-1 border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
              />
              <span className='text-blue-800'>라면,</span>
              <input
                type='text'
                value={hypothesis.split(',')[1] || ''}
                onChange={(e) => {
                  const parts = hypothesis.split(',');
                  parts[1] = e.target.value;
                  setHypothesis(parts.join(','));
                }}
                placeholder='예상 결과를 입력하세요'
                className='flex-1 px-2 py-1 border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
              />
              <span className='text-blue-800'>일 것이다.</span>
            </div>
          </div>

          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>
              ✏️ 왜 그렇게 생각했나요?
            </label>
            <textarea
              value={hypothesisReason}
              onChange={(e) => setHypothesisReason(e.target.value)}
              placeholder='가설을 세운 이유나 근거를 적어보세요.'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none'
            />
          </div>
        </div>
      </div>

      {/* 5. AI 피드백 받기 */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          ☐ AI에게 내 가설을 피드백 받아 봅시다.
        </label>

        <div className='bg-purple-50 p-4 rounded-lg'>
          <h4 className='font-medium text-purple-900 mb-3 flex items-center gap-2'>
            🤖 AI에게 물어보자!
          </h4>

          <div className='space-y-3'>
            <div className='text-sm text-purple-800 space-y-1'>
              <p>
                💬 내가 세운 가설은 "만약 초콜릿을 햇빛에 두면 빨리 녹을
                것이다."야. 이 가설에 대해 피드백 해 줘.
              </p>
              <p>
                💬 내 가설이 괜찮은지, 더 구체적으로 쓸 수 있는 방법이 있을까?
              </p>
            </div>

            <button
              onClick={getHypothesisFeedback}
              disabled={isLoadingAI || !hypothesis.trim()}
              className='w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors'
            >
              {isLoadingAI
                ? '🤖 AI가 피드백하는 중...'
                : '🤖 AI에게 가설 피드백 받기'}
            </button>
          </div>

          {aiFeedback && (
            <div className='mt-3 p-3 bg-white border border-purple-200 rounded-lg'>
              <h5 className='font-medium text-gray-900 mb-2'>AI의 피드백</h5>
              <div className='text-sm text-gray-700 whitespace-pre-line'>
                {aiFeedback}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. 최종 가설 정리 */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          ☐ 피드백을 참고해 탐구 질문에 대한 최종 가설을 정리해 봅시다.
        </label>

        <div className='bg-green-50 p-3 rounded-lg'>
          <div className='font-medium text-green-900 mb-2'>
            &lt;최종가설&gt;
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <span className='text-green-800'>만약</span>
            <input
              type='text'
              value={finalHypothesis.split(',')[0] || ''}
              onChange={(e) => {
                const parts = finalHypothesis.split(',');
                parts[0] = e.target.value;
                setFinalHypothesis(parts.join(','));
              }}
              placeholder='최종 조건'
              className='flex-1 px-2 py-1 border border-green-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500'
            />
            <span className='text-green-800'>라면,</span>
            <input
              type='text'
              value={finalHypothesis.split(',')[1] || ''}
              onChange={(e) => {
                const parts = finalHypothesis.split(',');
                parts[1] = e.target.value;
                setFinalHypothesis(parts.join(','));
              }}
              placeholder='최종 예상 결과'
              className='flex-1 px-2 py-1 border border-green-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500'
            />
            <span className='text-green-800'>일 것이다.</span>
          </div>
        </div>
      </div>

      {/* AI 자유 질문 */}
      <div className='bg-orange-50 p-4 rounded-lg'>
        <h4 className='font-medium text-orange-900 mb-3 flex items-center gap-2'>
          <MessageSquare size={16} />
          AI에게 자유롭게 질문하기
        </h4>
        <div className='space-y-3'>
          <div className='flex gap-2'>
            <input
              type='text'
              value={currentAIQuestion}
              onChange={(e) => setCurrentAIQuestion(e.target.value)}
              placeholder='궁금한 점을 자유롭게 질문해보세요...'
              className='flex-1 px-3 py-2 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500'
              onKeyPress={(e) => e.key === 'Enter' && askAIQuestion()}
            />
            <button
              onClick={askAIQuestion}
              disabled={isLoadingAI || !currentAIQuestion.trim()}
              className='px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors'
            >
              {isLoadingAI ? '생각중...' : '질문'}
            </button>
          </div>

          {aiResponse && (
            <div className='bg-white p-3 rounded-md border border-orange-200'>
              <p className='text-sm text-gray-700'>{aiResponse}</p>
            </div>
          )}
        </div>
      </div>

      {/* Q&A 히스토리 */}
      {qaHistory.length > 0 && (
        <div>
          <h4 className='font-medium text-gray-900 mb-3'>이전 질문들</h4>
          <div className='space-y-2 max-h-40 overflow-y-auto'>
            {qaHistory.map((qa) => (
              <div key={qa.id} className='bg-gray-50 p-3 rounded-md'>
                <p className='text-sm font-medium text-gray-900'>
                  Q: {qa.question}
                </p>
                {qa.ai_feedback && (
                  <p className='text-sm text-gray-600 mt-1'>
                    A: {qa.ai_feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
          다음 단계로 (3단계: 실험 계획하기)
        </button>
      </div>
    </div>
  );
};
