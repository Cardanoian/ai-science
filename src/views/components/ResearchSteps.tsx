import React, { useState, useEffect } from 'react';
import type { ResearchController } from '../../controllers/ResearchController';

// 각 단계별 컴포넌트 import
import Step1Component from './research-steps/Step1Component';
import Step2Component from './research-steps/Step2Component';
import Step3Component from './research-steps/Step3Component';
import Step4Component from './research-steps/Step4Component';
import Step5Component from './research-steps/Step5Component';
import Step6Component from './research-steps/Step6Component';

import type { ResearchStepContent } from '../../models/types';

interface ResearchStepsProps {
  currentStep: number;
  stepData: Partial<ResearchStepContent>;
  onDataChange: (data: Partial<ResearchStepContent>) => void;
  onSave: (data: Partial<ResearchStepContent>, completed?: boolean) => void;
  onAIHelp: (question: string, context?: Partial<ResearchStepContent>) => void;
  onGeneratePresentation: () => void; // 추가
  onViewPresentation: () => void; // 추가
  researchController: ResearchController;
  isAIRequesting: boolean;
}

const ResearchSteps: React.FC<ResearchStepsProps> = ({
  currentStep,
  stepData,
  onDataChange,
  onSave,
  onAIHelp,
  onGeneratePresentation, // 추가
  onViewPresentation, // 추가
  researchController,
  isAIRequesting,
}) => {
  const [localData, setLocalData] = useState(stepData);

  // stepData 변경 시 localData 업데이트
  useEffect(() => {
    setLocalData(stepData);
  }, [stepData]);

  // 데이터 변경 핸들러
  const handleDataChange = (key: string, value: unknown) => {
    const newData = { ...localData, [key]: value };
    setLocalData(newData);
    onDataChange(newData);
  };

  // 배열 아이템 추가
  const handleAddItem = (key: string, defaultValue: string = '') => {
    const currentArray = (localData as Record<string, unknown[]>)[key] || [];
    handleDataChange(key, [...currentArray, defaultValue]);
  };

  // 배열 아이템 삭제
  const handleRemoveItem = (key: string, index: number) => {
    const currentArray = (localData as Record<string, unknown[]>)[key] || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    handleDataChange(key, newArray);
  };

  // 배열 아이템 업데이트
  const handleUpdateItem = (key: string, index: number, value: unknown) => {
    const currentArray = (localData as Record<string, unknown[]>)[key] || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    handleDataChange(key, newArray);
  };

  // 공통 props 객체
  const commonProps = {
    localData,
    onDataChange: handleDataChange,
    onAddItem: handleAddItem,
    onRemoveItem: handleRemoveItem,
    onUpdateItem: handleUpdateItem,
    onAIHelp,
    onSave,
    onGeneratePresentation,
    onViewPresentation,
    researchController,
    isAIRequesting,
  };

  // 단계별 컴포넌트 렌더링
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <Step1Component {...(commonProps as any)} />;
      case 2:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <Step2Component {...(commonProps as any)} />;
      case 3:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <Step3Component {...(commonProps as any)} />;
      case 4:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <Step4Component {...(commonProps as any)} />;
      case 5:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <Step5Component {...(commonProps as any)} />;
      case 6:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <Step6Component {...(commonProps as any)} />;
      default:
        return (
          <div className='text-center py-8 text-gray-500'>
            단계를 선택해주세요.
          </div>
        );
    }
  };

  return <div className='space-y-6'>{renderStepContent()}</div>;
};

export default ResearchSteps;
