import React from 'react';
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
import type { ChartData } from '../../models/types';

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
    '#3b82f6', // 파랑
    '#ef4444', // 빨강
    '#10b981', // 초록
    '#f59e0b', // 주황
    '#8b5cf6', // 보라
    '#06b6d4', // 청록
    '#f97316', // 진한 주황
    '#84cc16', // 연두
    '#6366f1', // 인디고
    '#ec4899', // 분홍
    '#a855f7', // 자주
    '#22c55e', // 에메랄드
    '#eab308', // 노랑
    '#d946ef', // 마젠타
    '#f43f5e', // 장미
    '#14b8a6', // 민트
  ];

  // 내부 상태 대신 existingData를 기반으로 작동
  const currentChartType = existingData?.type || 'bar';
  const currentTitle = existingData?.title || '';
  const currentXAxisLabel = existingData?.xAxisLabel || '';
  const currentYAxisLabel = existingData?.yAxisLabel || '';
  const currentSeries = existingData?.series || [
    { name: '자료 1', color: colors[0] },
  ];
  const currentDataPoints = existingData?.data.map((item) => {
    const values: { [key: string]: string } = {};
    currentSeries.forEach((s) => {
      const valueName = item[s.name];
      if (Array.isArray(valueName)) {
        values[s.name] = valueName[0]?.toString() || '';
      } else {
        values[s.name] = valueName?.toString() || '';
      }
    });
    return {
      name: item.name,
      values,
    };
  }) || [{ name: '', values: {} }];

  const showPreview = !!existingData; // existingData가 있으면 미리보기 표시

  // 차트 데이터 업데이트 함수 (모든 변경 사항을 onChartCreate로 전달)
  const updateChartData = (updates: Partial<ChartData>) => {
    const newChartData: ChartData = {
      id: existingData?.id || crypto.randomUUID(),
      type: updates.type || currentChartType,
      title: updates.title ?? currentTitle,
      xAxisLabel: updates.xAxisLabel ?? currentXAxisLabel,
      yAxisLabel: updates.yAxisLabel ?? currentYAxisLabel,
      series: updates.series || currentSeries,
      data: updates.data || existingData?.data || [],
    };
    onChartCreate(newChartData);
  };

  // 차트 타입 변경
  const handleChartTypeChange = (type: 'bar' | 'line' | 'pie') => {
    updateChartData({ type });
  };

  // 제목 변경
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateChartData({ title: e.target.value });
  };

  // X축 라벨 변경
  const handleXAxisLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateChartData({ xAxisLabel: e.target.value });
  };

  // Y축 라벨 변경
  const handleYAxisLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateChartData({ yAxisLabel: e.target.value });
  };

  // 범례 추가
  const addSeries = () => {
    if (currentSeries.length === colors.length) {
      return currentSeries;
    }
    const newSeriesItem = {
      name: `자료 ${currentSeries.length + 1}`,
      color: colors[currentSeries.length % colors.length],
    };
    const updatedSeries = [...currentSeries, newSeriesItem];

    // 기존 데이터 포인트에 새 시리즈 값 추가
    const updatedData = currentDataPoints.map((point) => {
      const newValues = { ...point.values, [newSeriesItem.name]: '' };
      return { ...point, values: newValues };
    });

    // 외부로 전달할 데이터 형식으로 변환 (string -> number[])
    const externalData = updatedData.map(
      (dataPoint: { name: string; values: { [key: string]: string } }) => {
        const newDataPoint: {
          name: string;
          [seriesName: string]: string | number[];
        } = {
          name: dataPoint.name,
        };
        for (const key in dataPoint.values) {
          newDataPoint[key] = [parseFloat(dataPoint.values[key] || '0') || 0];
        }
        return newDataPoint;
      }
    );

    updateChartData({ series: updatedSeries, data: externalData });
  };

  // 범례 삭제
  const removeSeries = (seriesName: string) => {
    if (currentSeries.length > 1) {
      const updatedSeries = currentSeries.filter((s) => s.name !== seriesName);

      // 데이터 포인트에서 해당 시리즈 값 제거
      const updatedData = currentDataPoints.map((point) => {
        const newValues = { ...point.values };
        delete newValues[seriesName];
        return { ...point, values: newValues };
      });

      // 외부로 전달할 데이터 형식으로 변환 (string -> number[])
      const externalData = updatedData.map(
        (dataPoint: { name: string; values: { [key: string]: string } }) => {
          const newDataPoint: {
            name: string;
            [seriesName: string]: string | number[];
          } = {
            name: dataPoint.name,
          };
          for (const key in dataPoint.values) {
            newDataPoint[key] = [parseFloat(dataPoint.values[key] || '0') || 0];
          }
          return newDataPoint;
        }
      );

      updateChartData({ series: updatedSeries, data: externalData });
    }
  };

  // 범례 이름 변경
  const updateSeriesName = (oldName: string, newName: string) => {
    const updatedSeries = currentSeries.map((s) =>
      s.name === oldName ? { ...s, name: newName } : s
    );

    // 데이터 포인트에서 키 이름 변경
    const updatedData = currentDataPoints.map((point) => {
      const newValues = { ...point.values };
      if (newValues[oldName] !== undefined) {
        newValues[newName] = newValues[oldName];
        delete newValues[oldName];
      }
      return { ...point, values: newValues };
    });

    // 외부로 전달할 데이터 형식으로 변환 (string -> number[])
    const externalData = updatedData.map(
      (dataPoint: { name: string; values: { [key: string]: string } }) => {
        const newDataPoint: {
          name: string;
          [seriesName: string]: string | number[];
        } = {
          name: dataPoint.name,
        };
        for (const key in dataPoint.values) {
          newDataPoint[key] = [parseFloat(dataPoint.values[key] || '0') || 0];
        }
        return newDataPoint;
      }
    );

    updateChartData({ series: updatedSeries, data: externalData });
  };

  // 데이터 포인트 추가
  const addDataPoint = () => {
    const newValues: { [key: string]: string } = {};
    currentSeries.forEach((s) => {
      newValues[s.name] = '';
    });
    const updatedData = [...currentDataPoints, { name: '', values: newValues }];

    // 외부로 전달할 데이터 형식으로 변환 (string -> number[])
    const externalData = updatedData.map(
      (dataPoint: { name: string; values: { [key: string]: string } }) => {
        const newDataPoint: {
          name: string;
          [seriesName: string]: string | number[];
        } = {
          name: dataPoint.name,
        };
        for (const key in dataPoint.values) {
          newDataPoint[key] = [parseFloat(dataPoint.values[key] || '0') || 0];
        }
        return newDataPoint;
      }
    );

    updateChartData({ data: externalData });
  };

  // 데이터 포인트 삭제
  const removeDataPoint = (index: number) => {
    if (currentDataPoints.length > 2) {
      const updatedData = currentDataPoints.filter((_, i) => i !== index);

      // 외부로 전달할 데이터 형식으로 변환 (string -> number[])
      const externalData = updatedData.map(
        (dataPoint: { name: string; values: { [key: string]: string } }) => {
          const newDataPoint: {
            name: string;
            [seriesName: string]: string | number[];
          } = {
            name: dataPoint.name,
          };
          for (const key in dataPoint.values) {
            newDataPoint[key] = [parseFloat(dataPoint.values[key] || '0') || 0];
          }
          return newDataPoint;
        }
      );

      updateChartData({ data: externalData });
    }
  };

  // 데이터 포인트 업데이트
  const updateDataPoint = (
    index: number,
    field: 'name' | string,
    value: string
  ) => {
    const updatedData = currentDataPoints.map((item, i) => {
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
    });

    // 외부로 전달할 데이터 형식으로 변환 (string -> number[])
    const externalData = updatedData.map(
      (dataPoint: { name: string; values: { [key: string]: string } }) => {
        const newDataPoint: {
          name: string;
          [seriesName: string]: string | number[];
        } = {
          name: dataPoint.name,
        };
        for (const key in dataPoint.values) {
          newDataPoint[key] = [parseFloat(dataPoint.values[key] || '0') || 0];
        }
        return newDataPoint;
      }
    );

    updateChartData({ data: externalData });
  };

  // 차트 데이터 변환 (렌더링용)
  const getChartData = () => {
    if (currentChartType === 'pie') {
      // 파이 차트는 첫 번째 시리즈만 사용
      const firstSeries = currentSeries[0];
      return currentDataPoints
        .filter((item) => item.name && item.values[firstSeries?.name])
        .map((item) => ({
          name: item.name,
          value: parseFloat(item.values[firstSeries?.name] || '0') || 0,
        }));
    } else {
      // 라인/바 차트는 모든 시리즈 사용
      return currentDataPoints
        .filter((item) => {
          return item.name && currentSeries.some((s) => item.values[s.name]);
        })
        .map((item) => {
          const dataPoint: { name: string; [key: string]: number | string } = {
            name: item.name,
          };
          currentSeries.forEach((s) => {
            dataPoint[s.name] = parseFloat(item.values[s.name] || '0') || 0;
          });
          return dataPoint;
        });
    }
  };

  // 차트 생성 (실제로는 onChartCreate를 통해 부모 상태 업데이트)
  const handleCreateChart = () => {
    const internalChartData = getChartData();

    if (!currentTitle.trim()) {
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
        const newDataPoint: { name: string; [key: string]: string | number[] } =
          {
            name: dataPoint.name, // name 속성을 명시적으로 초기화
          };
        for (const key in dataPoint) {
          if (key === 'name') {
            continue; // 이미 위에서 할당했으므로 건너뜁니다.
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
      id: existingData?.id || crypto.randomUUID(),
      type: currentChartType,
      title: currentTitle.trim() ?? '',
      xAxisLabel: currentXAxisLabel.trim() ?? undefined,
      yAxisLabel: currentYAxisLabel.trim() ?? undefined,
      series: currentSeries,
      data: externalChartData as Array<{
        name: string;
        [seriesName: string]: string | number[];
      }>,
    };

    onChartCreate(newChart);
  };

  // 차트 초기화
  const handleReset = () => {
    onChartCreate(undefined as unknown as ChartData); // 부모 컴포넌트의 chartData를 초기화
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

    switch (currentChartType) {
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
                label={
                  currentXAxisLabel.trim()
                    ? {
                        value: currentXAxisLabel,
                        position: 'insideBottom',
                        offset: -10,
                      }
                    : undefined
                }
              />
              <YAxis
                domain={[
                  Math.floor((statistics?.minimum || 0) * 0.9),
                  Math.ceil((statistics?.maximum || 0) * 1.1),
                ]}
                label={
                  currentYAxisLabel.trim()
                    ? {
                        value: currentYAxisLabel,
                        angle: -90,
                        position: 'insideLeft',
                      }
                    : undefined
                }
              />
              <Tooltip />
              {currentSeries.length > 1 && <Legend />}
              {currentSeries.map((s) => (
                <Bar key={s.name} dataKey={s.name} fill={s.color} name={s.name}>
                  {currentSeries.length === 1 && (
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
                label={
                  currentXAxisLabel.trim()
                    ? {
                        value: currentXAxisLabel,
                        position: 'insideBottom',
                        offset: -10,
                      }
                    : undefined
                }
              />
              <YAxis
                domain={[
                  Math.floor((statistics?.minimum || 0) * 0.9),
                  Math.ceil((statistics?.maximum || 0) * 1.1),
                ]}
                label={
                  currentYAxisLabel.trim()
                    ? {
                        value: currentYAxisLabel,
                        angle: -90,
                        position: 'insideLeft',
                      }
                    : undefined
                }
              />
              <Tooltip />
              {currentSeries.length > 1 && <Legend />}
              {currentSeries.map((s) => (
                <Line
                  key={s.name}
                  type='monotone'
                  dataKey={s.name}
                  stroke={s.color}
                  strokeWidth={3}
                  dot={{ fill: s.color, strokeWidth: 2, r: 6 }}
                  name={s.name}
                >
                  {currentSeries.length === 1 && (
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

    if (currentChartType === 'pie') {
      const pieData = data as Array<{ value: number }>;
      allValues = pieData.map((item) => item.value);
    } else {
      const multiSeriesData = data as Array<{ [key: string]: number | string }>;
      currentSeries.forEach((s) => {
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
              onClick={() => handleChartTypeChange(type)}
              className={`p-4 border-2 rounded-lg transition-all text-center ${
                currentChartType === type
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
            value={currentTitle}
            onChange={(e) => handleTitleChange(e)}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            placeholder='예: 식물 성장 실험 결과'
          />
        </div>

        {currentChartType !== 'pie' && (
          <>
            <div>
              <label className='block font-medium text-gray-700 mb-2'>
                가로축 라벨
              </label>
              <input
                type='text'
                value={currentXAxisLabel}
                onChange={(e) => handleXAxisLabelChange(e)}
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
                value={currentYAxisLabel}
                onChange={(e) => handleYAxisLabelChange(e)}
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='예: 높이(cm)'
              />
            </div>
          </>
        )}
      </div>

      {/* 범례 관리 (파이 차트가 아닌 경우) */}
      {currentChartType !== 'pie' && (
        <div>
          <label className='block font-semibold text-gray-800 mb-3'>
            범례 관리:
          </label>
          <div className='space-y-3'>
            {currentSeries.map((s, index) => (
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
                {currentSeries.length > 1 && (
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
                currentChartType === 'pie'
                  ? '1fr 1fr auto'
                  : `1fr repeat(${currentSeries.length}, 1fr) auto`,
            }}
          >
            <div className='font-medium text-sm text-gray-600 p-2'>
              {currentChartType === 'pie'
                ? '항목'
                : currentXAxisLabel || '가로축'}
            </div>
            {currentChartType === 'pie' ? (
              <div className='font-medium text-sm text-gray-600 p-2'>
                {currentYAxisLabel || '값'}
              </div>
            ) : (
              currentSeries.map((s) => (
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
          {currentDataPoints.map((point, index) => (
            <div
              key={index}
              className='grid gap-2'
              style={{
                gridTemplateColumns:
                  currentChartType === 'pie'
                    ? '1fr 1fr auto'
                    : `1fr repeat(${currentSeries.length}, 1fr) auto`,
              }}
            >
              <input
                type='text'
                value={point.name}
                onChange={(e) => updateDataPoint(index, 'name', e.target.value)}
                className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder={`항목 ${index + 1}`}
              />

              {currentChartType === 'pie' ? (
                <input
                  type='number'
                  value={point.values[currentSeries[0]?.name] || ''}
                  onChange={(e) =>
                    updateDataPoint(
                      index,
                      currentSeries[0]?.name,
                      e.target.value
                    )
                  }
                  className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='숫자값'
                  step='0.1'
                />
              ) : (
                currentSeries.map((s) => (
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

              {currentDataPoints.length > 2 && (
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
