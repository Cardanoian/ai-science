import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  LineChart,
  PieChart,
  Plus,
  Trash2,
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
  LabelList,
  Legend,
} from 'recharts';
import type { ChartData, ChartSeries } from '../../models/types';

interface ChartGeneratorProps {
  onChartCreate: (chartData: ChartData) => void;
  existingData?: ChartData;
}

const ChartGenerator: React.FC<ChartGeneratorProps> = ({
  onChartCreate,
  existingData,
}) => {
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

  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [title, setTitle] = useState('');
  const [xAxisLabel, setXAxisLabel] = useState('');
  const [yAxisLabel, setYAxisLabel] = useState('');
  const [series, setSeries] = useState<ChartSeries[]>([
    { name: '자료 1', color: colors[0] },
  ]);
  const [dataPoints, setDataPoints] = useState<
    Array<{ name: string; values: { [seriesName: string]: string } }>
  >([
    { name: '', values: {} },
    { name: '', values: {} },
  ]);
  const [showPreview, setShowPreview] = useState(false);

  // 기존 데이터가 있으면 로드
  useEffect(() => {
    if (existingData) {
      setChartType(existingData.type);
      setTitle(existingData.title);
      setXAxisLabel(existingData.xAxisLabel || '');
      setYAxisLabel(existingData.yAxisLabel || '');

      if (existingData.series) {
        setSeries(existingData.series);
        setDataPoints(
          existingData.data.map((item) => {
            const values: { [key: string]: string } = {};
            existingData.series.forEach((s) => {
              const value = item[s.name];
              if (Array.isArray(value)) {
                values[s.name] = value[0]?.toString() || '';
              } else {
                values[s.name] = value?.toString() || '';
              }
            });
            return {
              name: item.name,
              values,
            };
          })
        );
      } else {
        // 기존 단일 시리즈 데이터 호환성
        setDataPoints(
          existingData.data.map((item) => ({
            name: item.name,
            values: {
              '자료 1': (item as { value?: number }).value?.toString() || '',
            },
          }))
        );
      }
      setShowPreview(true);
    }
  }, [existingData]);

  // 범례 추가
  const addSeries = () => {
    const newSeries = {
      name: `자료 ${series.length + 1}`,
      color: colors[series.length % colors.length],
    };
    setSeries((prev) => [...prev, newSeries]);

    // 기존 데이터 포인트에 새 시리즈 값 추가
    setDataPoints((prev) =>
      prev.map((point) => ({
        ...point,
        values: { ...point.values, [newSeries.name]: '' },
      }))
    );
  };

  // 범례 삭제
  const removeSeries = (seriesName: string) => {
    if (series.length > 1) {
      setSeries((prev) => prev.filter((s) => s.name !== seriesName));

      // 데이터 포인트에서 해당 시리즈 값 제거
      setDataPoints((prev) =>
        prev.map((point) => {
          const newValues = { ...point.values };
          delete newValues[seriesName];
          return { ...point, values: newValues };
        })
      );
    }
  };

  // 범례 이름 변경
  const updateSeriesName = (oldName: string, newName: string) => {
    setSeries((prev) =>
      prev.map((s) => (s.name === oldName ? { ...s, name: newName } : s))
    );

    // 데이터 포인트에서 키 이름 변경
    setDataPoints((prev) =>
      prev.map((point) => {
        const newValues = { ...point.values };
        if (newValues[oldName] !== undefined) {
          newValues[newName] = newValues[oldName];
          delete newValues[oldName];
        }
        return { ...point, values: newValues };
      })
    );
  };

  // 데이터 포인트 추가
  const addDataPoint = () => {
    const newValues: { [key: string]: string } = {};
    series.forEach((s) => {
      newValues[s.name] = '';
    });
    setDataPoints((prev) => [...prev, { name: '', values: newValues }]);
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
    field: 'name' | string,
    value: string
  ) => {
    setDataPoints((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          if (field === 'name') {
            return { ...item, name: value };
          } else {
            return {
              ...item,
              values: { ...item.values, [field]: value },
            };
          }
        }
        return item;
      })
    );
  };

  // 차트 데이터 변환
  const getChartData = () => {
    if (chartType === 'pie') {
      // 파이 차트는 첫 번째 시리즈만 사용
      const firstSeries = series[0];
      return dataPoints
        .filter((item) => item.name && item.values[firstSeries?.name])
        .map((item) => ({
          name: item.name,
          value: parseFloat(item.values[firstSeries?.name] || '0') || 0,
        }));
    } else {
      // 라인/바 차트는 모든 시리즈 사용
      return dataPoints
        .filter((item) => {
          return item.name && series.some((s) => item.values[s.name]);
        })
        .map((item) => {
          const dataPoint: { name: string; [key: string]: number | string } = {
            name: item.name,
          };
          series.forEach((s) => {
            dataPoint[s.name] = parseFloat(item.values[s.name] || '0') || 0;
          });
          return dataPoint;
        });
    }
  };

  // 차트 생성
  const handleCreateChart = () => {
    const internalChartData = getChartData();

    if (!title.trim()) {
      alert('차트 제목을 입력해주세요.');
      return;
    }

    if (internalChartData.length < 2) {
      alert('최소 2개의 데이터가 필요합니다.');
      return;
    }

    // 외부로 전달할 데이터 형식으로 변환 (number -> number[])
    const externalChartData = internalChartData.map(
      (dataPoint: { name: string; [key: string]: string | number }) => {
        const newDataPoint: { [key: string]: string | number[] } = {};
        for (const key in dataPoint) {
          if (key === 'name') {
            newDataPoint[key] = dataPoint[key] as string;
          } else if (typeof dataPoint[key] === 'number') {
            newDataPoint[key] = [dataPoint[key] as number];
          } else {
            newDataPoint[key] = dataPoint[key] as string;
          }
        }
        return newDataPoint;
      }
    );

    const newChart: ChartData = {
      id: crypto.randomUUID(),
      type: chartType,
      title: title.trim(),
      xAxisLabel: xAxisLabel.trim() || undefined,
      yAxisLabel: yAxisLabel.trim() || undefined,
      series: series,
      data: externalChartData as Array<{
        name: string;
        [seriesName: string]: string | number[];
      }>,
    };

    onChartCreate(newChart);
    setShowPreview(true);
  };

  // 차트 초기화
  const handleReset = () => {
    setTitle('');
    setXAxisLabel('');
    setYAxisLabel('');
    setSeries([{ name: '시리즈 1', color: colors[0] }]);
    setDataPoints([
      { name: '', values: {} },
      { name: '', values: {} },
    ]);
    setShowPreview(false);
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
              margin={{ top: 40, right: 30, left: 20, bottom: 60 }}
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
              {series.length > 1 && <Legend />}
              {series.map((s) => (
                <Bar key={s.name} dataKey={s.name} fill={s.color} name={s.name}>
                  {series.length === 1 && (
                    <LabelList
                      dataKey={s.name}
                      position='top'
                      style={{
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        fill: '#374151',
                      }}
                    />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <RechartsLineChart
              data={data}
              margin={{ top: 40, right: 30, left: 20, bottom: 60 }}
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
              {series.length > 1 && <Legend />}
              {series.map((s) => (
                <Line
                  key={s.name}
                  type='monotone'
                  dataKey={s.name}
                  stroke={s.color}
                  strokeWidth={3}
                  dot={{ fill: s.color, strokeWidth: 2, r: 6 }}
                  name={s.name}
                >
                  {series.length === 1 && (
                    <LabelList
                      dataKey={s.name}
                      position='top'
                      style={{
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        fill: '#374151',
                      }}
                    />
                  )}
                </Line>
              ))}
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
                label={({ name, value, percent }) =>
                  `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
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

    let allValues: number[] = [];

    if (chartType === 'pie') {
      const pieData = data as Array<{ value: number }>;
      allValues = pieData.map((item) => item.value);
    } else {
      const multiSeriesData = data as Array<{ [key: string]: number | string }>;
      series.forEach((s) => {
        const seriesValues = multiSeriesData.map(
          (item) => (item[s.name] as number) || 0
        );
        allValues.push(...seriesValues);
      });
    }

    if (allValues.length === 0) return null;

    const sum = allValues.reduce((a, b) => a + b, 0);
    const avg = sum / allValues.length;
    const max = Math.max(...allValues);
    const min = Math.min(...allValues);

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
            placeholder='예: 식물 성장 실험 결과'
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
                placeholder='예: 날짜'
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
                placeholder='예: 높이(cm)'
              />
            </div>
          </>
        )}
      </div>

      {/* 범례 관리 (파이 차트가 아닌 경우) */}
      {chartType !== 'pie' && (
        <div>
          <label className='block font-semibold text-gray-800 mb-3'>
            범례 관리:
          </label>
          <div className='space-y-3'>
            {series.map((s, index) => (
              <div key={index} className='flex items-center gap-3'>
                <div
                  className='w-6 h-6 rounded border-2 border-gray-300'
                  style={{ backgroundColor: s.color }}
                ></div>
                <input
                  type='text'
                  value={s.name}
                  onChange={(e) => updateSeriesName(s.name, e.target.value)}
                  className='flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder={`범례 ${index + 1} (예: 고추)`}
                />
                {series.length > 1 && (
                  <button
                    onClick={() => removeSeries(s.name)}
                    className='p-2 text-red-500 hover:text-red-700 transition-colors'
                    title='범례 삭제'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={addSeries}
              className='flex items-center space-x-2 px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors'
            >
              <Plus className='w-4 h-4' />
              <span>범례 추가</span>
            </button>
          </div>
        </div>
      )}

      {/* 데이터 입력 */}
      <div>
        <label className='block font-semibold text-gray-800 mb-3'>
          데이터 입력:
        </label>
        <div className='space-y-3'>
          {/* 헤더 */}
          <div
            className='grid gap-2'
            style={{
              gridTemplateColumns:
                chartType === 'pie'
                  ? '1fr 1fr auto'
                  : `1fr repeat(${series.length}, 1fr) auto`,
            }}
          >
            <div className='font-medium text-sm text-gray-600 p-2'>
              {chartType === 'pie' ? '항목' : xAxisLabel || '가로축'}
            </div>
            {chartType === 'pie' ? (
              <div className='font-medium text-sm text-gray-600 p-2'>
                {yAxisLabel || '값'}
              </div>
            ) : (
              series.map((s) => (
                <div
                  key={s.name}
                  className='font-medium text-sm text-gray-600 p-2 text-center'
                >
                  <div className='flex items-center justify-center gap-2'>
                    <div
                      className='w-3 h-3 rounded'
                      style={{ backgroundColor: s.color }}
                    ></div>
                    {s.name}
                  </div>
                </div>
              ))
            )}
            <div className='w-10'></div>
          </div>

          {/* 데이터 행 */}
          {dataPoints.map((point, index) => (
            <div
              key={index}
              className='grid gap-2'
              style={{
                gridTemplateColumns:
                  chartType === 'pie'
                    ? '1fr 1fr auto'
                    : `1fr repeat(${series.length}, 1fr) auto`,
              }}
            >
              <input
                type='text'
                value={point.name}
                onChange={(e) => updateDataPoint(index, 'name', e.target.value)}
                className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder={`항목 ${index + 1}`}
              />

              {chartType === 'pie' ? (
                <input
                  type='number'
                  value={point.values[series[0]?.name] || ''}
                  onChange={(e) =>
                    updateDataPoint(index, series[0]?.name, e.target.value)
                  }
                  className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='숫자값'
                  step='0.1'
                />
              ) : (
                series.map((s) => (
                  <input
                    key={s.name}
                    type='number'
                    value={point.values[s.name] || ''}
                    onChange={(e) =>
                      updateDataPoint(index, s.name, e.target.value)
                    }
                    className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='숫자값'
                    step='0.1'
                  />
                ))
              )}

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
          <li>
            • 막대/선 그래프에서는 여러 범례를 추가하여 다양한 데이터를 비교할
            수 있어요
          </li>
          <li>• 데이터는 최소 2개 이상 입력해야 차트가 생성됩니다</li>
        </ul>
      </div>
    </div>
  );
};

export default ChartGenerator;
