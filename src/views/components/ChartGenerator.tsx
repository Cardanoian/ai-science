import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  LineChart,
  PieChart,
  Plus,
  Trash2,
  Download,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

interface ChartData {
  id: string;
  type: 'bar' | 'line' | 'pie';
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  data: Array<{
    name: string;
    value: number;
  }>;
}

interface ChartGeneratorProps {
  onChartCreate: (chartData: ChartData) => void;
  existingData?: ChartData;
}

const ChartGenerator: React.FC<ChartGeneratorProps> = ({
  onChartCreate,
  existingData,
}) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [title, setTitle] = useState('');
  const [xAxisLabel, setXAxisLabel] = useState('');
  const [yAxisLabel, setYAxisLabel] = useState('');
  const [dataPoints, setDataPoints] = useState<
    Array<{ name: string; value: string }>
  >([
    { name: '', value: '' },
    { name: '', value: '' },
  ]);
  const [showPreview, setShowPreview] = useState(false);

  // 기존 데이터가 있으면 로드
  useEffect(() => {
    if (existingData) {
      setChartType(existingData.type);
      setTitle(existingData.title);
      setXAxisLabel(existingData.xAxisLabel || '');
      setYAxisLabel(existingData.yAxisLabel || '');
      setDataPoints(
        existingData.data.map((item) => ({
          name: item.name,
          value: item.value.toString(),
        }))
      );
      setShowPreview(true);
    }
  }, [existingData]);

  // 차트 색상 팔레트
  const colors = [
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#06b6d4',
    '#f97316',
    '#84cc16',
  ];

  // 데이터 포인트 추가
  const addDataPoint = () => {
    setDataPoints((prev) => [...prev, { name: '', value: '' }]);
  };

  // 데이터 포인트 삭제
  const removeDataPoint = (index: number) => {
    if (dataPoints.length > 2) {
      setDataPoints((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // 데이터 포인트 업데이트
  const updateDataPoint = (
    index: number,
    field: 'name' | 'value',
    value: string
  ) => {
    setDataPoints((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // 차트 데이터 변환
  const getChartData = () => {
    return dataPoints
      .filter((item) => item.name && item.value)
      .map((item) => ({
        name: item.name,
        value: parseFloat(item.value) || 0,
      }));
  };

  // 차트 생성
  const handleCreateChart = () => {
    const chartData = getChartData();

    if (!title.trim()) {
      alert('차트 제목을 입력해주세요.');
      return;
    }

    if (chartData.length < 2) {
      alert('최소 2개의 데이터가 필요합니다.');
      return;
    }

    const newChart: ChartData = {
      id: crypto.randomUUID(),
      type: chartType,
      title: title.trim(),
      xAxisLabel: xAxisLabel.trim() || undefined,
      yAxisLabel: yAxisLabel.trim() || undefined,
      data: chartData,
    };

    onChartCreate(newChart);
    setShowPreview(true);
  };

  // 차트 초기화
  const handleReset = () => {
    setTitle('');
    setXAxisLabel('');
    setYAxisLabel('');
    setDataPoints([
      { name: '', value: '' },
      { name: '', value: '' },
    ]);
    setShowPreview(false);
  };

  // 데이터 내보내기
  const handleExport = () => {
    const chartData = getChartData();
    const csvContent = [
      [xAxisLabel || '항목', yAxisLabel || '값'].join(','),
      ...chartData.map((item) => [item.name, item.value].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title || '차트데이터'}.csv`;
    link.click();
  };

  // 차트 렌더링
  const renderChart = () => {
    const data = getChartData();
    if (data.length === 0) return null;

    const commonProps = {
      width: '100%',
      height: 300,
      data,
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='name'
                angle={-45}
                textAnchor='end'
                height={80}
                interval={0}
              />
              <YAxis
                domain={[
                  Math.floor((statistics?.minimum || 0) * 0.9),
                  Math.ceil((statistics?.maximum || 0) * 1.1),
                ]}
              />
              <Tooltip />
              <Bar dataKey='value' fill={colors[0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <RechartsLineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='name'
                angle={-45}
                textAnchor='end'
                height={80}
                interval={0}
              />
              <YAxis
                domain={[
                  Math.floor((statistics?.minimum || 0) * 0.9),
                  Math.ceil((statistics?.maximum || 0) * 1.1),
                ]}
              />
              <Tooltip />
              <Line
                type='monotone'
                dataKey='value'
                stroke={colors[1]}
                strokeWidth={3}
                dot={{ fill: colors[1], strokeWidth: 2, r: 6 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <RechartsPieChart>
              <Pie
                data={data}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
              >
                {data.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  // 통계 계산
  const getStatistics = () => {
    const data = getChartData();
    if (data.length === 0) return null;

    const values = data.map((item) => item.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return {
      count: data.length,
      sum: sum.toFixed(2),
      average: avg.toFixed(2),
      maximum: max,
      minimum: min,
      range: (max - min).toFixed(2),
    };
  };

  const statistics = getStatistics();

  return (
    <div className='space-y-6'>
      {/* 차트 타입 선택 */}
      <div>
        <label className='block font-semibold text-gray-800 mb-3'>
          차트 종류 선택:
        </label>
        <div className='grid grid-cols-3 gap-3'>
          {[
            {
              type: 'bar' as const,
              icon: BarChart3,
              name: '막대 그래프',
              desc: '비교에 적합',
            },
            {
              type: 'line' as const,
              icon: LineChart,
              name: '선 그래프',
              desc: '변화 추이',
            },
            {
              type: 'pie' as const,
              icon: PieChart,
              name: '원 그래프',
              desc: '비율 표시',
            },
          ].map(({ type, icon: Icon, name, desc }) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`p-4 border-2 rounded-lg transition-all text-center ${
                chartType === type
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <Icon className='w-8 h-8 mx-auto mb-2' />
              <div className='font-medium text-sm'>{name}</div>
              <div className='text-xs opacity-70'>{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 차트 제목 및 축 라벨 */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div>
          <label className='block font-medium text-gray-700 mb-2'>
            차트 제목 <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            placeholder='예: 실험 결과'
          />
        </div>

        {chartType !== 'pie' && (
          <>
            <div>
              <label className='block font-medium text-gray-700 mb-2'>
                가로축 라벨
              </label>
              <input
                type='text'
                value={xAxisLabel}
                onChange={(e) => setXAxisLabel(e.target.value)}
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='예: 시간'
              />
            </div>

            <div>
              <label className='block font-medium text-gray-700 mb-2'>
                세로축 라벨
              </label>
              <input
                type='text'
                value={yAxisLabel}
                onChange={(e) => setYAxisLabel(e.target.value)}
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='예: 온도(°C)'
              />
            </div>
          </>
        )}
      </div>

      {/* 데이터 입력 */}
      <div>
        <label className='block font-semibold text-gray-800 mb-3'>
          데이터 입력:
        </label>
        <div className='space-y-3'>
          <div className='flex gap-4 font-medium text-sm text-gray-600 mx-10 justify-between'>
            <div>
              {chartType === 'pie' ? '항목' : xAxisLabel || '가로 수치'}
            </div>
            <div>{chartType === 'pie' ? '값' : yAxisLabel || '세로 수치'}</div>
          </div>

          {dataPoints.map((point, index) => (
            <div
              key={index}
              className='flex flex-col md:flex-row gap-2 md:gap-4'
            >
              <input
                type='text'
                value={point.name}
                onChange={(e) => updateDataPoint(index, 'name', e.target.value)}
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder={`항목 ${index + 1}`}
              />
              <div className='flex items-center w-full gap-2'>
                <input
                  type='number'
                  value={point.value}
                  onChange={(e) =>
                    updateDataPoint(index, 'value', e.target.value)
                  }
                  className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='숫자값'
                  step='0.1'
                />
                {dataPoints.length > 2 && (
                  <button
                    onClick={() => removeDataPoint(index)}
                    className='p-2 text-red-500 hover:text-red-700 transition-colors flex-shrink-0'
                    title='삭제'
                  >
                    <Trash2 className='w-5 h-5' />
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={addDataPoint}
            className='flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors'
          >
            <Plus className='w-4 h-4' />
            <span>데이터 추가</span>
          </button>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className='flex space-x-3'>
        <button
          onClick={handleCreateChart}
          className='flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
        >
          <BarChart3 className='w-4 h-4' />
          <span>차트 생성</span>
        </button>

        <button
          onClick={handleReset}
          className='flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
        >
          <RefreshCw className='w-4 h-4' />
          <span>초기화</span>
        </button>
      </div>

      {/* 차트 미리보기 */}
      {showPreview && getChartData().length > 0 && (
        <div className='border border-gray-200 rounded-lg p-6 bg-gray-50'>
          <div className='flex items-center justify-between mb-4'>
            <h4 className='font-semibold text-lg text-gray-800'>{title}</h4>
            <div className='flex space-x-2'>
              <button
                onClick={handleExport}
                className='flex items-center space-x-1 px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors min-h-10 min-w-10'
              >
                <Download className='w-4 h-4' />
                <span className='hidden md:inline'>CSV 다운로드</span>
              </button>
            </div>
          </div>

          <div className='bg-white rounded-lg p-4 mb-4'>{renderChart()}</div>

          {/* 통계 정보 */}
          {statistics && (
            <div className='bg-white rounded-lg p-4'>
              <h5 className='font-medium text-gray-800 mb-3 flex items-center space-x-2'>
                <TrendingUp className='w-4 h-4' />
                <span>통계 정보</span>
              </h5>
              <div className='grid grid-cols-2 md:grid-cols-6 gap-4 text-sm'>
                <div className='text-center'>
                  <div className='font-medium text-gray-600'>개수</div>
                  <div className='text-lg font-bold text-blue-600'>
                    {statistics.count}
                  </div>
                </div>
                <div className='text-center'>
                  <div className='font-medium text-gray-600'>합계</div>
                  <div className='text-lg font-bold text-green-600'>
                    {statistics.sum}
                  </div>
                </div>
                <div className='text-center'>
                  <div className='font-medium text-gray-600'>평균</div>
                  <div className='text-lg font-bold text-purple-600'>
                    {statistics.average}
                  </div>
                </div>
                <div className='text-center'>
                  <div className='font-medium text-gray-600'>최댓값</div>
                  <div className='text-lg font-bold text-red-600'>
                    {statistics.maximum}
                  </div>
                </div>
                <div className='text-center'>
                  <div className='font-medium text-gray-600'>최솟값</div>
                  <div className='text-lg font-bold text-orange-600'>
                    {statistics.minimum}
                  </div>
                </div>
                <div className='text-center'>
                  <div className='font-medium text-gray-600'>범위</div>
                  <div className='text-lg font-bold text-gray-600'>
                    {statistics.range}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 도움말 */}
      <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
        <h5 className='font-medium text-blue-800 mb-2'>💡 차트 생성 팁:</h5>
        <ul className='text-sm text-blue-700 space-y-1'>
          <li>
            • <strong>막대 그래프:</strong> 서로 다른 항목들을 비교할 때
            사용하세요
          </li>
          <li>
            • <strong>선 그래프:</strong> 시간에 따른 변화나 경향을 보여줄 때
            적합해요
          </li>
          <li>
            • <strong>원 그래프:</strong> 전체에서 각 부분의 비율을 나타낼 때
            사용하세요
          </li>
          <li>• 데이터는 최소 2개 이상 입력해야 차트가 생성됩니다</li>
        </ul>
      </div>
    </div>
  );
};

export default ChartGenerator;
