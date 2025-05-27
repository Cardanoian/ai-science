import React, { useState, useEffect } from 'react';
import { Flask, Save, AlertTriangle, Plus, Trash2, BookOpen, Lightbulb } from 'lucide-react';
import { GeminiAIService } from '../../../../services/GeminiAIService';

interface Step3ContentProps {
  projectId: string;
  controller: any;
  onStepComplete: (data: any, completed?: boolean) => Promise<void>;
  stepInfo: any;
}

export const Step3Content: React.FC<Step3ContentProps> = ({
  projectId,
  controller,
  onStepComplete,
  stepInfo
}) => {
  const [geminiService] = useState(() => new GeminiAIService());
  
  // 워크북 항목들
  const [aiExperimentIdea, setAiExperimentIdea] = useState('');
  const [sameConditions, setSameConditions] = useState(''); // 같게 해야 할 것
  const [differentConditions, setDifferentConditions] = useState(''); // 다르게 해야 할 것
  const [resultToObserve, setResultToObserve] = useState(''); // 결과로 알아볼 것
  const [myModifications, setMyModifications] = useState(''); // 내가 바꾸고 싶은 점
  const [finalExperimentPlan, setFinalExperimentPlan] = useState('');
  const [materials, setMaterials] = useState('');
  const [problems, setProblems] = useState('');
  const [problemType, setProblemType] = useState<string[]>([]);
  const [problemDetails, setProblemDetails] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [improvements, setImprovements] = useState('');
  const [revisedPlan, setRevisedPlan] = useState('');
  
  // UI 상태
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showProblemSection, setShowProblemSection] = useState(false);

  const problemOptions = [
    '준비물이 부족했어요',
    '실험이 잘 안 됐어요',
    '내가 예상한 대로 결과가 안 나왔어요',
    '기타'
  ];

  const getExperimentIdea = async () => {
    setIsLoadingAI(true);
    try {
      // 이전 단계에서 저장된 탐구 질문 가져오기
      const steps = await controller.researchModel.getStepsByProjectId(projectId);
      const step2 = steps.find((s: any) => s.step_number === 2);
      const question = step2?.content?.finalQuestion || '탐구 질문';

      const response = await geminiService.suggestExperiment(question);
      
      if (response.success) {
        setAiExperimentIdea(response.message);
      } else {
        alert('실험 아이디어를 받는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error getting experiment idea:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getAdviceForProblems = async () => {
    if (!problemDetails.trim()) {
      alert('먼저 문제점을 자세히 적어주세요!');
      return;
    }

    setIsLoadingAI(true);
    try {
      const response = await geminiService.askQuestion(
        `실험에서 이런 문제가 생겼어: ${problemDetails}. 어떻게 해결할 수 있을까?`,
        '실험 문제 해결'
      );
      
      if (response.success) {
        setAiAdvice(response.message);
      } else {
        alert('조언을 받는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error getting AI advice:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleProblemTypeChange = (option: string) => {
    if (problemType.includes(option)) {
      setProblemType(problemType.filter(type => type !== option));
    } else {
      setProblemType([...problemType, option]);
    }
  };

  const handleSave = async () => {
    const data = {
      aiExperimentIdea,
      sameConditions,
      differentConditions,
      resultToObserve,
      myModifications,
      finalExperimentPlan,
      materials,
      problems,
      problemType,
      problemDetails,
      aiAdvice,
      improvements,
      revisedPlan
    };

    await onStepComplete(data, false);
  };

  const handleComplete = async () => {
    if (!finalExperimentPlan.trim() || !materials.trim()) {
      alert('실험 계획과 준비물을 모두 입력해주세요.');
      return;
    }

    const data = {
      aiExperimentIdea,
      sameConditions,
      differentConditions,
      resultToObserve,
      myModifications,
      finalExperimentPlan,
      materials,
      problems,
      problemType,
      problemDetails,
      aiAdvice,
      improvements,
      revisedPlan: revisedPlan || finalExperimentPlan
    };

    await onStepComplete(data, true);
  };

  return (
    <div className="space-y-6">
      {/* 워크북 제목 */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Flask className="text-orange-600 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-orange-900 mb-2">✅ 3단계: 실험 계획하기</h3>
            <p className="text-orange-800 text-sm">
              AI의 도움을 받아 실험을 구체적으로 계획해 보고, 준비물을 정리해요! 
              실험 중 문제가 생기면 다시 생각하고, AI의 도움을 받아 수정해 봅시다.
            </p>
          </div>
        </div>
      </div>

      {/* 1. AI에게 실험 아이디어 물어보기 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ☐ AI에게 실험 아이디어를 물어봐요!
        </label>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
            🤖 AI에게 물어보자!
          </h4>
          
          <div className="space-y-3">
            <div className="text-sm text-purple-800 space-y-1">
              <p>💬 이 탐구 질문으로 실험을 하려면 어떻게 하면 될까?</p>
              <p>💬 실험 아이디어를 알려줘!</p>
            </div>

            <button
              onClick={getExperimentIdea}
              disabled={isLoadingAI}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {isLoadingAI ? '🤖 AI가 실험을 계획하는 중...' : '🤖 AI에게 실험 아이디어 받기'}
            </button>
          </div>

          {aiExperimentIdea && (
            <div className="mt-3 p-3 bg-white border border-purple-200 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">✏️ AI가 제안한 실험 아이디어</h5>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {aiExperimentIdea}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. 변인 통제 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ☐ 실험에서 같게 해야 할 것과 다르게 해야 할 것을 정리해 봅시다. (변인통제)
        </label>
        
        {/* 변인통제 설명 */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium text-blue-900 mb-2">💬 변인통제란?</h4>
          <p className="text-sm text-blue-800 mb-3">
            실험에서 정확한 결과를 얻기 위해 무엇을 같게 하고, 무엇을 다르게 해야 하는지 정하는 것입니다.
          </p>
          
          {/* 예시 테이블 */}
          <div className="bg-white p-3 rounded border border-blue-200">
            <h5 className="font-medium text-blue-900 mb-2">💡변인통제 예시</h5>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-blue-300">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="border border-blue-300 p-2 text-left">구분</th>
                    <th className="border border-blue-300 p-2 text-left">내용</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-blue-300 p-2 font-medium">다르게 해야 할 것</td>
                    <td className="border border-blue-300 p-2">얼음을 놓아둘 종이의 색깔</td>
                  </tr>
                  <tr>
                    <td className="border border-blue-300 p-2 font-medium">같게해야 할 것</td>
                    <td className="border border-blue-300 p-2">얼음의 크기와 모양, 종이를 놓는 장소, 실험 시간, 바람의 세기</td>
                  </tr>
                  <tr>
                    <td className="border border-blue-300 p-2 font-medium">결과로 알아볼 것</td>
                    <td className="border border-blue-300 p-2">얼음이 녹는 속도</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 변인 입력 */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ✅ 같게 해야 할 것
            </label>
            <textarea
              value={sameConditions}
              onChange={(e) => setSameConditions(e.target.value)}
              placeholder="실험에서 동일하게 유지해야 할 조건들을 적어보세요."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ✅ 다르게 해야 할 것
            </label>
            <textarea
              value={differentConditions}
              onChange={(e) => setDifferentConditions(e.target.value)}
              placeholder="실험에서 바꿔가며 비교할 조건을 적어보세요."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ✅ 결과로 알아볼 것
            </label>
            <textarea
              value={resultToObserve}
              onChange={(e) => setResultToObserve(e.target.value)}
              placeholder="실험을 통해 관찰하고 측정할 결과를 적어보세요."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none"
            />
          </div>
        </div>
      </div>

      {/* 3. AI 아이디어에 내 생각 더하기 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ☐ AI의 아이디어에 내 생각을 더해서 실험을 계획해 봅시다.
        </label>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ✅ AI가 제안한 내용에 내가 바꾸거나 추가하고 싶은 점은?
            </label>
            <textarea
              value={myModifications}
              onChange={(e) => setMyModifications(e.target.value)}
              placeholder="AI 제안을 바탕으로 내가 수정하거나 추가하고 싶은 아이디어를 적어보세요."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ✏️ 최종 실험 계획
            </label>
            <textarea
              value={finalExperimentPlan}
              onChange={(e) => setFinalExperimentPlan(e.target.value)}
              placeholder="AI 아이디어와 내 생각을 합쳐서 최종 실험 계획을 적어보세요."
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none bg-green-50"
            />
          </div>
        </div>
      </div>

      {/* 4. 실험 준비물 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ☐ 실험을 위해 필요한 준비물을 정리해 봅시다.
        </label>
        <textarea
          value={materials}
          onChange={(e) => setMaterials(e.target.value)}
          placeholder="실험에 필요한 재료와 도구들을 모두 적어보세요."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
        />
      </div>

      {/* 5. 실험 문제점 기록 (선택사항) */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            id="showProblems"
            checked={showProblemSection}
            onChange={(e) => setShowProblemSection(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="showProblems" className="text-sm font-medium text-gray-700">
            ☐ 실험을 하면서 생긴 문제점을 기록해 봅시다. (실험 후 작성)
          </label>
        </div>

        {showProblemSection && (
          <div className="bg-red-50 p-4 rounded-lg space-y-4">
            <div>
              <label className="block text-xs font-medium text-red-800 mb-2">
                ✏️ 어떤 문제가 있었나요?
              </label>
              <div className="space-y-2">
                {problemOptions.map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={problemType.includes(option)}
                      onChange={() => handleProblemTypeChange(option)}
                      className="rounded"
                    />
                    <span className="text-sm text-red-800">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-red-800 mb-1">
                ✏️ 문제를 자세히 적어 봅시다.
              </label>
              <textarea
                value={problemDetails}
                onChange={(e) => setProblemDetails(e.target.value)}
                placeholder="실험에서 어떤 문제가 있었는지 구체적으로 적어보세요."
                className="w-full px-3 py-2 border border-red-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 h-16 resize-none"
              />
            </div>

            {/* AI 조언 받기 */}
            <div>
              <label className="block text-xs font-medium text-red-800 mb-2">
                ☐ AI와 함께 문제를 해결하는 방법을 찾아봅시다.
              </label>
              
              <button
                onClick={getAdviceForProblems}
                disabled={isLoadingAI || !problemDetails.trim()}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors mb-3"
              >
                {isLoadingAI ? '🤖 AI가 해결책을 찾는 중...' : '🤖 AI에게 해결 방법 물어보기'}
              </button>

              {aiAdvice && (
                <div className="p-3 bg-white border border-red-200 rounded-lg">
                  <h6 className="font-medium text-gray-900 mb-2">✏️ AI의 조언</h6>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {aiAdvice}
                  </div>
                </div>
              )}
            </div>

            {/* 개선사항 */}
            <div>
              <label className="block text-xs font-medium text-red-800 mb-1">
                ☐ 문제를 해결할 수 있는 실험 방법으로 수정해 봅시다.
              </label>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-red-700 mb-1">
                    ✏️ 문제를 해결하기 위해 바꾼 점
                  </label>
                  <textarea
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    placeholder="어떤 부분을 어떻게 개선했는지 적어보세요."
                    className="w-full px-3 py-2 border border-red-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 h-16 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-red-700 mb-1">
                    ✏️ 수정한 실험 계획
                  </label>
                  <textarea
                    value={revisedPlan}
                    onChange={(e) => setRevisedPlan(e.target.value)}
                    placeholder="문제점을 개선한 새로운 실험 계획을 적어보세요."
                    className="w-full px-3 py-2 border border-red-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 h-20 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 예시 */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
          <Lightbulb size={16} />
          워크북 예시
        </h4>
        <div className="text-sm text-yellow-800 space-y-2">
          <p><strong>실험 주제:</strong> 물의 온도와 설탕 용해 속도</p>
          <p><strong>다르게 할 것:</strong> 물의 온도 (차가운 물, 미지근한 물, 뜨거운 물)</p>
          <p><strong>같게 할 것:</strong> 설탕의 양, 물의 양, 젓는 횟수, 설탕 입자 크기</p>
          <p><strong>결과 관찰:</strong> 설탕이 완전히 녹는데 걸리는 시간</p>
          <p><strong>준비물:</strong> 설탕, 물, 온도계, 스톱워치, 컵 3개, 숟가락</p>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Save size={16} />
          임시 저장
        </button>
        <button
          onClick={handleComplete}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          다음 단계로 (4단계: 결과 정리)
        </button>
      </div>
    </div>
  );
};

// src/views/components/research/steps/Step4Content.tsx (워크북 연동)
import React, { useState, useEffect } from 'react';
import { BarChart, Save, Download, Plus, FileText, BookOpen, Lightbulb } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart as RechartsBarChart, Bar, ResponsiveContainer } from 'recharts';
import { GeminiAIService } from '../../../../services/GeminiAIService';

interface Step4ContentProps {
  projectId: string;
  controller: any;
  onStepComplete: (data: any, completed?: boolean) => Promise<void>;
  stepInfo: any;
}

export const Step4Content: React.FC<Step4ContentProps> = ({
  projectId,
  controller,
  onStepComplete,
  stepInfo
}) => {
  const [geminiService] = useState(() => new GeminiAIService());
  
  // 워크북 항목들
  const [experimentResults, setExperimentResults] = useState('');
  const [tableData, setTableData] = useState('');
  const [hypothesisCheck, setHypothesisCheck] = useState('');
  const [hypothesisReason, setHypothesisReason] = useState('');
  const [conclusions, setConclusions] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [finalConclusions, setFinalConclusions] = useState('');
  
  // 차트 관련
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartTitle, setChartTitle] = useState('');
  const [chartType, setChartType] = useState<'line' | 'bar'>('bar');
  const [xAxisLabel, setXAxisLabel] = useState('');
  const [yAxisLabel, setYAxisLabel] = useState('');
  const [savedCharts, setSavedCharts] = useState<any[]>([]);
  
  // UI 상태
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    loadExperimentData();
  }, [projectId]);

  const loadExperimentData = async () => {
    try {
      const data = await controller.researchModel.getExperimentData(projectId);
      setSavedCharts(data.filter((d: any) => d.data_type === 'chart'));
    } catch (error) {
      console.error('Error loading experiment data:', error);
    }
  };

  const suggestTableFormat = async () => {
    if (!experimentResults.trim()) {
      alert('먼저 실험 결과를 적어주세요!');
      return;
    }

    setIsLoadingAI(true);
    try {
      const response = await geminiService.askQuestion(
        `이 실험 결과를 표로 정리해줘: ${experimentResults}`,
        '실험 결과 표 만들기'
      );
      
      if (response.success) {
        setTableData(response.message);
      }
    } catch (error) {
      console.error('Error getting table suggestion:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const addDataPoint = () => {
    setChartData([...chartData, { label: '', value: 0 }]);
  };

  const updateDataPoint = (index: number, field: string, value: any) => {
    const newData = [...chartData];
    newData[index] = { ...newData[index], [field]: value };
    setChartData(newData);
  };

  const removeDataPoint = (index: number) => {
    setChartData(chartData.filter((_, i) => i !== index));
  };

  const createChart = async () => {
    if (!chartTitle || chartData.length === 0) {
      alert('차트 제목과 데이터를 입력해주세요.');
      return;
    }

    const validation = controller.validateExperimentData(chartData);
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    try {
      await controller.createChart({
        projectId,
        type: chartType,
        title: chartTitle,
        xAxis: xAxisLabel,
        yAxis: yAxisLabel,
        data: chartData
      });
      await loadExperimentData();
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  };

  const getConclusionFeedback = async () => {
    if (!conclusions.trim()) {
      alert('먼저 결론을 적어주세요!');
      return;
    }

    setIsLoadingAI(true);
    try {
      // 이전 단계에서 가설 가져오기
      const steps = await controller.researchModel.getStepsByProjectId(projectId);
      const step2 = steps.find((s: any) => s.step_number === 2);
      const hypothesis = step2?.content?.finalHypothesis || '';

      const response = await geminiService.analyzeResults(conclusions, hypothesis);
      
      if (response.success) {
        setAiFeedback(response.message);
      }
    } catch (error) {
      console.error('Error getting conclusion feedback:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const exportChart = (chartData: any) => {
    controller.exportChartData(chartData);
  };

  const handleSave = async () => {
    const data = {
      experimentResults,
      tableData,
      hypothesisCheck,
      hypothesisReason,
      conclusions,
      aiFeedback,
      finalConclusions,
      chartsCount: savedCharts.length
    };

    await onStepComplete(data, false);
  };

  const handleComplete = async () => {
    if (!experimentResults.trim() || !finalConclusions.trim()) {
      alert('실험 결과와 최종 결론을 모두 입력해주세요.');
      return;
    }

    const data = {
      experimentResults,
      tableData,
      hypothesisCheck,
      hypothesisReason,
      conclusions,
      aiFeedback,
      finalConclusions,
      chartsCount: savedCharts.length
    };

    await onStepComplete(data, true);
  };

  return (
    <div className="space-y-6">
      {/* 워크북 제목 */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <BarChart className="text-green-600 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-green-900 mb-2">✅ 4단계: 결과 정리 및 결론 도출</h3>
            <p className="text-green-800 text-sm">
              실험이 끝난 뒤에는 결과를 잘 정리하고, 가설과 비교해 보며 나만의 결론을 내리는 것이 중요합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 1. 실험 결과 기록 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ☐ 실험 결과를 기록해 봅시다. (글과 그림 등 다양한 방법으로 기록)
        </label>
        <textarea
          value={experimentResults}
          onChange={(e) => setExperimentResults(e.target.value)}
          placeholder="실험하면서 관찰한 내용과 측정한 결과를 자세히 적어보세요."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
        />
      </div>

      {/* 2. 표나 그래프로 정리 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ☐ 표나 그래프로 정리할 수 있는 탐구라면 아래 공간에 정리해 봅시다.
        </label>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
            🤖 AI에게 물어보자!
          </h4>
          
          <div className="space-y-3">
            <div className="text-sm text-purple-800 space-y-1">
              <p>💬 이 실험 결과를 표로 정리해줘</p>
              <p>💬 그래프로 나타낼 수 있을까?</p>
            </div>

            <button
              onClick={suggestTableFormat}
              disabled={isLoadingAI || !experimentResults.trim()}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {isLoadingAI ? '🤖 AI가 표를 만드는 중...' : '🤖 AI에게 표 만들기 도움 받기'}
            </button>
          </div>

          {tableData && (
            <div className="mt-3 p-3 bg-white border border-purple-200 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">AI가 제안한 표 형식</h5>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {tableData}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 차트 생성 섹션 */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-3">📊 실험 데이터로 그래프 만들기</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              차트 제목
            </label>
            <input
              type="text"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              placeholder="예: 온도에 따른 용해 시간"
              className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              차트 유형
            </label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as 'line' | 'bar')}
              className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="bar">막대그래프</option>
              <option value="line">선그래프</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              X축 라벨
            </label>
            <input
              type="text"
              value={xAxisLabel}
              onChange={(e) => setXAxisLabel(e.target.value)}
              placeholder="예: 온도(°C)"
              className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Y축 라벨
            </label>
            <input
              type="text"
              value={yAxisLabel}
              onChange={(e) => setYAxisLabel(e.target.value)}
              placeholder="예: 시간(초)"
              className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 데이터 입력 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            실험 데이터
          </label>
          {chartData.map((point, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={point.label}
                onChange={(e) => updateDataPoint(index, 'label', e.target.value)}
                placeholder="항목명"
                className="flex-1 px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={point.value}
                onChange={(e) => updateDataPoint(index, 'value', parseFloat(e.target.value) || 0)}
                placeholder="값"
                className="w-24 px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => removeDataPoint(index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                삭제
              </button>
            </div>
          ))}
          <button
            onClick={addDataPoint}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Plus size={16} />
            데이터 추가
          </button>
        </div>

        {/* 차트 미리보기 */}
        {chartData.length > 0 && (
          <div className="mb-4">
            <h5 className="font-medium text-gray-700 mb-2">미리보기</h5>
            <div className="bg-white p-4 rounded-md border" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <RechartsBarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </RechartsBarChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <button
          onClick={createChart}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <BarChart size={16} />
          차트 생성
        </button>
      </div>

      {/* 저장된 차트들 */}
      {savedCharts.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">생성된 차트</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedCharts.map((chart) => (
              <div key={chart.id} className="bg-white p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900">{chart.title}</h5>
                  <button
                    onClick={() => exportChart(chart)}
                    className="text-blue-600 hover:text-blue-700"
                    title="데이터 다운로드"
                  >
                    <Download size={16} />
                  </button>
                </div>
                <div style={{ height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {chart.data.type === 'bar' ? (
                      <RechartsBarChart data={chart.data.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </RechartsBarChart>
                    ) : (
                      <LineChart data={chart.data.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. 가설 검증 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ☐ 가설을 검증해 봅시다.
        </label>
        
        <div className="space-y-4">
          <div>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="hypothesis"
                  value="correct"
                  checked={hypothesisCheck === 'correct'}
                  onChange={(e) => setHypothesisCheck(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-sm">☐ 내 가설이 맞았다</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="hypothesis"
                  value="wrong"
                  checked={hypothesisCheck === 'wrong'}
                  onChange={(e) => setHypothesisCheck(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-sm">☐ 틀렸다</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="hypothesis"
                  value="partial"
                  checked={hypothesisCheck === 'partial'}
                  onChange={(e) => setHypothesisCheck(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-sm">☐ 부분적으로 맞았다</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                ✏️ 그 이유는 무엇인가요?
              </label>
              <textarea
                value={hypothesisReason}
                onChange={(e) => setHypothesisReason(e.target.value)}
                placeholder="가설과 실험 결과를 비교해서 왜 그런 결과가 나왔는지 생각해보세요."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. 결론 도출 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ☐ 결론을 도출해 봅시다.
        </label>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            ✏️ 실험을 통해 내가 알게 된 사실을 정리해 봅시다.
          </label>
          <textarea
            value={conclusions}
            onChange={(e) => setConclusions(e.target.value)}
            placeholder="실험 결과를 바탕으로 알게 된 사실들을 정리해보세요."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
          />
        </div>
      </div>

      {/* AI 피드백 */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
          🤖 AI에게 물어보자!
        </h4>
        
        <div className="space-y-3">
          <div className="text-sm text-purple-800">
            <p>💬 내가 정리한 결론이 어때? 더 잘 쓸 수 있을까?</p>
          </div>

          <button
            onClick={getConclusionFeedback}
            disabled={isLoadingAI || !conclusions.trim()}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {isLoadingAI ? '🤖 AI가 분석하는 중...' : '🤖 AI에게 결론 피드백 받기'}
          </button>
        </div>

        {aiFeedback && (
          <div className="mt-3 p-3 bg-white border border-purple-200 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">✏️ AI의 피드백</h5>
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {aiFeedback}
            </div>
          </div>
        )}
      </div>

      {/* 5. 최종 결론 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ✏️나의 최종 결론
        </label>
        <textarea
          value={finalConclusions}
          onChange={(e) => setFinalConclusions(e.target.value)}
          placeholder="AI 피드백을 참고해서 최종 결론을 정리해보세요."
          className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none bg-green-50"
        />
      </div>

      {/* 예시 */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
          <Lightbulb size={16} />
          워크북 예시
        </h4>
        <div className="text-sm text-yellow-800 space-y-2">
          <p><strong>실험 결과:</strong> 뜨거운 물(80°C)에서는 5초, 미지근한 물(40°C)에서는 15초, 차가운 물(10°C)에서는 45초가 걸렸다.</p>
          <p><strong>가설 검증:</strong> 맞았다 - 온도가 높을수록 설탕이 빨리 녹았다.</p>
          <p><strong>결론:</strong> 물의 온도가 높을수록 설탕이 빠르게 용해된다. 이는 온도가 높을 때 분자 운동이 활발해지기 때문이다.</p>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Save size={16} />
          임시 저장
        </button>
        <button
          onClick={handleComplete}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          다음 단계로 (5단계: 탐구 발표 준비)
        </button>
      </div>
    </div>
  );
};// src/views/components/research/steps/Step3Content.tsx (워크북 연동)
import React, { useState, useEffect } from 'react';
import { Flask, Save, AlertTriangle, Plus, Trash2, BookOpen, Lightbulb } from 'lucide-react';
import { GeminiAIService } from '../../../../services/GeminiAIService';

interface Step3ContentProps {
  projectId: string;
  controller: any;
  onStepComplete: (data: any, completed?: boolean) => Promise<void>;
  stepInfo: any;
}

export const Step3Content: React.FC<Step3ContentProps> = ({
  projectId,
  controller,
  onStepComplete,
  stepInfo
}) => {
  const [geminiService] = useState(() => new GeminiAIService());
  
  // 워크북 항목들
  const [aiExperimentIdea, setAiExperimentIdea] = useState('');
  const [sameConditions, setSameConditions] = useState(''); // 같게 해야 할 것
  const [differentConditions, setDifferentConditions] = useState(''); // 다르게 해야 할 것
  const [resultToObserve, setResultToObserve] = useState(''); // 결과로 알아볼 것
  const [myModifications, setMyModifications] = useState(''); // 내가 바꾸고 싶은 점
  const [finalExperimentPlan, setFinalExperimentPlan] = useState('');
  const [materials, setMaterials] = useState('');
  const [problems, setProblems] = useState('');
  const [problemType, setProblemType] = useState<string[]>([]);
  const [problemDetails, setProblemDetails] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [improvements, setImprovements] = useState('');
  const [revisedPlan, setRevisedPlan] = useState('');
  
  // UI 상태
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showProblemSection, setShowProblemSection] = useState(false);

  const problemOptions = [
    '준비물이 부족했어요',
    '실험이 잘 안 됐어요',
    '내가 예상한 대로 결과가 안 나왔어요',
    '기타'
  ];

  const getExperimentIdea = async () => {
    setIsLoadingAI(true);
    try {
      // 이전 단계에서 저장된 탐구 질문 가져오기
      const steps = await controller.researchModel.getStepsByProjectId(projectId);
      const step2 = steps.find((s: any) => s.step_number === 2);
      const question = step2?.content?.finalQuestion || '탐구 질문';

      const response = await geminiService.suggestExperiment(question);
      
      if (response.success) {
        setAiExperimentIdea(response.message);
      } else {
        alert('실험 아이디어를 받는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error getting experiment idea:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getAdviceForProblems = async () => {
    if (!problemDetails.trim()) {
      alert('먼저 문제점을 자세히 적어주세요!');
      return;
    }

    setIsLoadingAI(true);
    try {
      const response = await geminiService.askQuestion(
        `실험에서 이런 문제가 생겼어: ${problemDetails}. 어떻게 해결할 수 있을까?`,
        '실험 문제 해결'
      );
      
      if (response.success) {
        setAiAdvice(response.message);
      } else {
        alert('조언을 받는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error getting AI advice:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleProblemTypeChange = (option: string) => {
    if (problemType.includes(option)) {
      setProblemType(problemType.filter(type => type !== option));
    } else {
      setProblemType([...problemType, option]);
    }
  };

  const handleSave = async () => {
    const data = {
      aiExperimentIdea,
      sameConditions,
      differentConditions,
      resultToObserve,
      myModifications,
      finalExperimentPlan,
      materials,
      problems,
      problemType,
      problemDetails,
      aiAdvice,
      improvements,
      revisedPlan
    };

    await onStepComplete(data, false);
  };

  const handleComplete = async () => {
    if (!finalExperimentPlan.trim() || !materials.trim()) {
      alert('실험 계획과 준비물을 모두 입력해주세요.');
      return;
    }

    const data = {
      aiExperimentIdea,
      sameConditions,
      differentConditions,
      resultToObserve,
      myModifications,
      finalExperimentPlan,
      materials,
      problems,
      problemType,
      problemDetails,
      aiAdvice,
      improvements,
      revisedPlan: revisedPlan || finalExperimentPlan
    };

    await onStepComplete(data, true);
  };

  return (
    <div className="space-y-6">
      {/* 워크북 제목 */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Flask className="text-orange-600 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-orange-900 mb-2">✅ 3단계: 실험 계획하기</h3>
            <p className="text-orange-800 text-sm">
              AI의 도움을 받아 실험을 구체적으로 계획해 보고, 준비물을 정리해요! 
              실험 중 문제가 생기면 다시 생각하고, AI의 도움을 받아 수정해 봅시다.
            </p>
          </div>
        </div>
      </div>

      {/* 1. AI에게 실험 아이디어 물어보기 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ☐ AI에게 실험 아이디어를 물어봐요!
        </label>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
            🤖 AI에게 물어보자!
          </h4>
          
          <div className="space-y-3">
            <div className="text-sm text-purple-800 space-y-1">
              <p>💬 이 탐구 질문으로 실험을 하려면 어떻게 하면 될까?</p>
              <p>💬 실험 아이디어를 알려줘!</p>
            </div>

            <button
              onClick={getExperimentIdea}
              disabled={isLoadingAI}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {isLoadingAI ? '🤖 AI가 실험을 계획하는 중...' : '🤖 AI에게 실험 아이디어 받기'}
            </button>
          </div>

          {aiExperimentIdea && (
            <div className="mt-3 p-3 bg-white border border-purple-200 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">✏️ AI가 제안한 실험 아이디어</h5>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {aiExper