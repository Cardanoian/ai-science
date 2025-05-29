import type {
  ResearchProject,
  ResearchStep,
  ResearchStepContent,
  ExperimentData,
  PresentationData,
  PresentationSlide,
  ChartConfig,
} from './types';

export class ResearchProjectModel {
  private data: ResearchProject;
  private steps: ResearchStepModel[] = [];

  constructor(projectData: ResearchProject) {
    this.data = { ...projectData };
  }

  // Getter methods
  get id(): string {
    return this.data.id;
  }

  get noteId(): string {
    return this.data.note_id;
  }

  get title(): string | undefined {
    return this.data.title;
  }

  get studentName(): string {
    return this.data.student_name;
  }

  get currentStep(): number {
    return this.data.current_step;
  }

  get createdAt(): Date {
    return new Date(this.data.created_at);
  }

  get updatedAt(): Date {
    return new Date(this.data.updated_at);
  }

  get rawData(): ResearchProject {
    return { ...this.data };
  }

  get allSteps(): ResearchStepModel[] {
    return [...this.steps];
  }

  // 탐구 진행률 계산 (0-100%)
  get progressPercentage(): number {
    return Math.round((this.currentStep / 6) * 100);
  }

  // 현재 단계가 완료되었는지 확인
  get isCurrentStepCompleted(): boolean {
    const step = this.getStep(this.currentStep);
    return step ? step.isCompleted : false;
  }

  // 전체 프로젝트 완료 여부
  get isCompleted(): boolean {
    return this.currentStep >= 6 && this.isCurrentStepCompleted;
  }

  // 프로젝트 제목 유효성 검사
  static isValidTitle(title: string): boolean {
    return title.trim().length >= 2 && title.trim().length <= 100;
  }

  // 학생 이름 유효성 검사
  static isValidStudentName(name: string): boolean {
    return name.trim().length >= 1 && name.trim().length <= 50;
  }

  // 단계 유효성 검사
  static isValidStep(step: number): boolean {
    return step >= 1 && step <= 6;
  }

  // 프로젝트 정보 업데이트
  updateInfo(
    updates: Partial<Pick<ResearchProject, 'title' | 'student_name'>>
  ): ResearchProjectModel {
    const updatedData = {
      ...this.data,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return new ResearchProjectModel(updatedData);
  }

  // 다음 단계로 이동
  moveToNextStep(): ResearchProjectModel {
    if (this.currentStep >= 6) {
      throw new Error('이미 마지막 단계입니다.');
    }

    const updatedData = {
      ...this.data,
      current_step: this.currentStep + 1,
      updated_at: new Date().toISOString(),
    };

    return new ResearchProjectModel(updatedData);
  }

  // 이전 단계로 이동
  moveToPreviousStep(): ResearchProjectModel {
    if (this.currentStep <= 1) {
      throw new Error('이미 첫 번째 단계입니다.');
    }

    const updatedData = {
      ...this.data,
      current_step: this.currentStep - 1,
      updated_at: new Date().toISOString(),
    };

    return new ResearchProjectModel(updatedData);
  }

  // 특정 단계로 이동
  moveToStep(stepNumber: number): ResearchProjectModel {
    if (!ResearchProjectModel.isValidStep(stepNumber)) {
      throw new Error('유효하지 않은 단계 번호입니다.');
    }

    const updatedData = {
      ...this.data,
      current_step: stepNumber,
      updated_at: new Date().toISOString(),
    };

    return new ResearchProjectModel(updatedData);
  }

  // 단계 추가
  addStep(stepData: ResearchStepModel): void {
    this.steps.push(stepData);
    this.steps.sort((a, b) => a.stepNumber - b.stepNumber);
  }

  // 단계 조회
  getStep(stepNumber: number): ResearchStepModel | undefined {
    return this.steps.find((step) => step.stepNumber === stepNumber);
  }

  // 현재 단계 조회
  getCurrentStep(): ResearchStepModel | undefined {
    return this.getStep(this.currentStep);
  }

  // 완료된 단계 수 계산
  getCompletedStepsCount(): number {
    return this.steps.filter((step) => step.isCompleted).length;
  }

  // 탐구 요약 정보 생성
  getSummary(): string {
    const progress = this.progressPercentage;
    const status = this.isCompleted ? '완료' : '진행중';
    return `${this.title || '제목 없음'} - ${status} (${progress}%)`;
  }

  // 프로젝트 소요 시간 계산
  getDuration(): { days: number; hours: number } {
    const now = new Date();
    const created = this.createdAt;
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    return { days: diffDays, hours: diffHours };
  }

  // 6단계 탐구학습 템플릿
  static getStepTemplates(): Array<{
    number: number;
    title: string;
    description: string;
    fields: string[];
  }> {
    return [
      {
        number: 1,
        title: '탐구 주제 찾기',
        description: '관심 있는 현상을 관찰하고 탐구할 주제를 선정합니다.',
        fields: ['interests', 'selectedTopic', 'topicReason'],
      },
      {
        number: 2,
        title: '탐구 질문과 가설',
        description:
          '관찰한 현상에 대한 질문을 만들고 예상 답안을 가설로 세웁니다.',
        fields: ['observations', 'researchQuestion', 'hypothesis'],
      },
      {
        number: 3,
        title: '실험 계획하기',
        description: '가설을 검증하기 위한 실험을 구체적으로 계획합니다.',
        fields: ['materials', 'procedure', 'variables', 'safetyPrecautions'],
      },
      {
        number: 4,
        title: '결과 정리 및 결론',
        description: '실험 결과를 정리하고 분석하여 결론을 도출합니다.',
        fields: ['experimentResults', 'dataAnalysis', 'conclusion'],
      },
      {
        number: 5,
        title: '탐구 발표 준비',
        description:
          '탐구 과정과 결과를 다른 사람들에게 발표할 자료를 준비합니다.',
        fields: ['presentationSlides', 'presentationScript'],
      },
      {
        number: 6,
        title: '성찰하기',
        description: '탐구 과정을 돌아보고 배운 점과 개선점을 정리합니다.',
        fields: ['whatLearned', 'challenges', 'improvements', 'nextResearch'],
      },
    ];
  }

  // JSON 직렬화
  toJSON(): ResearchProject {
    return this.rawData;
  }

  // 문자열 표현
  toString(): string {
    return `ResearchProject(${this.id}): ${this.title} by ${this.studentName} - Step ${this.currentStep}/6`;
  }
}

export class ResearchStepModel {
  private data: ResearchStep;

  constructor(stepData: ResearchStep) {
    this.data = { ...stepData };
  }

  // Getter methods
  get id(): string {
    return this.data.id;
  }

  get projectId(): string {
    return this.data.project_id;
  }

  get stepNumber(): number {
    return this.data.step_number;
  }

  get stepTitle(): string {
    return this.data.step_title;
  }

  get content(): ResearchStepContent {
    return this.data.content as ResearchStepContent;
  }

  get isCompleted(): boolean {
    return this.data.completed;
  }

  get createdAt(): Date {
    return new Date(this.data.created_at);
  }

  get updatedAt(): Date {
    return new Date(this.data.updated_at);
  }

  get rawData(): ResearchStep {
    return { ...this.data };
  }

  // 단계 내용 업데이트
  updateContent(newContent: Partial<ResearchStepContent>): ResearchStepModel {
    const updatedData = {
      ...this.data,
      content: { ...this.content, ...newContent },
      updated_at: new Date().toISOString(),
    };

    return new ResearchStepModel(updatedData);
  }

  // 단계 완료 표시
  markAsCompleted(): ResearchStepModel {
    const updatedData = {
      ...this.data,
      completed: true,
      updated_at: new Date().toISOString(),
    };

    return new ResearchStepModel(updatedData);
  }

  // 단계 미완료 표시
  markAsIncomplete(): ResearchStepModel {
    const updatedData = {
      ...this.data,
      completed: false,
      updated_at: new Date().toISOString(),
    };

    return new ResearchStepModel(updatedData);
  }

  // 필수 필드 완성도 확인
  getCompletionPercentage(): number {
    const template = ResearchProjectModel.getStepTemplates().find(
      (t) => t.number === this.stepNumber
    );

    if (!template) return 0;

    const requiredFields = template.fields;
    const completedFields = requiredFields.filter((field) => {
      const value = this.content[field as keyof ResearchStepContent];
      return value !== undefined && value !== null && value !== '';
    });

    return Math.round((completedFields.length / requiredFields.length) * 100);
  }

  // 단계별 검증 로직
  validateContent(): string[] {
    const errors: string[] = [];

    switch (this.stepNumber) {
      case 1:
        if (!this.content.selectedTopic) {
          errors.push('탐구 주제를 선택해주세요.');
        }
        if (!this.content.topicReason) {
          errors.push('주제 선택 이유를 작성해주세요.');
        }
        break;

      case 2:
        if (!this.content.researchQuestion) {
          errors.push('탐구 질문을 작성해주세요.');
        }
        if (!this.content.hypothesis) {
          errors.push('가설을 세워주세요.');
        }
        break;

      case 3:
        if (!this.content.materials?.length) {
          errors.push('실험 재료를 입력해주세요.');
        }
        if (!this.content.procedure?.length) {
          errors.push('실험 절차를 작성해주세요.');
        }
        break;

      case 4:
        if (!this.content.experimentResults?.length) {
          errors.push('실험 결과를 입력해주세요.');
        }
        if (!this.content.conclusion) {
          errors.push('결론을 작성해주세요.');
        }
        break;

      case 5:
        if (!this.content.presentationSlides?.length) {
          errors.push('발표 자료를 준비해주세요.');
        }
        break;

      case 6:
        if (!this.content.whatLearned) {
          errors.push('배운 점을 작성해주세요.');
        }
        break;
    }

    return errors;
  }

  // JSON 직렬화
  toJSON(): ResearchStep {
    return this.rawData;
  }

  // 문자열 표현
  toString(): string {
    const completion = this.getCompletionPercentage();
    return `Step ${this.stepNumber}: ${this.stepTitle} (${completion}% 완료)`;
  }
}

export class ExperimentDataModel {
  private data: ExperimentData;

  constructor(experimentData: ExperimentData) {
    this.data = { ...experimentData };
  }

  // Getter methods
  get id(): string {
    return this.data.id;
  }

  get projectId(): string {
    return this.data.project_id;
  }

  get dataType(): string {
    return this.data.data_type;
  }

  get title(): string {
    return this.data.title;
  }

  get dataContent(): Record<string, unknown> {
    return this.data.data;
  }

  get createdAt(): Date {
    return new Date(this.data.created_at);
  }

  get rawData(): ExperimentData {
    return { ...this.data };
  }

  // 차트 생성을 위한 데이터 변환
  getChartConfig(): ChartConfig | null {
    try {
      switch (this.dataType) {
        case 'measurement':
          return this.createMeasurementChart();
        case 'survey':
          return this.createSurveyChart();
        case 'observation':
          return this.createObservationChart();
        default:
          return null;
      }
    } catch (error) {
      console.error('차트 설정 생성 중 오류:', error);
      return null;
    }
  }

  private createMeasurementChart(): ChartConfig {
    const measurementsRaw = (this.dataContent as Record<string, unknown>)
      .measurements;
    const measurements = Array.isArray(measurementsRaw) ? measurementsRaw : [];
    const xLabelRaw = (this.dataContent as Record<string, unknown>).xLabel;
    const yLabelRaw = (this.dataContent as Record<string, unknown>).yLabel;
    const xAxisLabel = typeof xLabelRaw === 'string' ? xLabelRaw : 'X축';
    const yAxisLabel = typeof yLabelRaw === 'string' ? yLabelRaw : 'Y축';

    return {
      type: 'line',
      title: this.title,
      xAxisLabel,
      yAxisLabel,
      data: measurements.map(
        (item: { name?: string; value: string | number }, index: number) => ({
          name: typeof item.name === 'string' ? item.name : `측정 ${index + 1}`,
          value:
            typeof item.value === 'number'
              ? item.value
              : parseFloat(String(item.value)) || 0,
        })
      ),
    };
  }

  private createSurveyChart(): ChartConfig {
    const responsesRaw = (this.dataContent as Record<string, unknown>)
      .responses;
    const responses = Array.isArray(responsesRaw) ? responsesRaw : [];
    return {
      type: 'pie',
      title: this.title,
      data: responses.map(
        (item: { option: string; count: string | number }) => ({
          name: typeof item.option === 'string' ? item.option : '',
          value:
            typeof item.count === 'number'
              ? item.count
              : parseInt(String(item.count)) || 0,
        })
      ),
    };
  }

  private createObservationChart(): ChartConfig {
    const observationsRaw = (this.dataContent as Record<string, unknown>)
      .observations;
    const observations = Array.isArray(observationsRaw) ? observationsRaw : [];
    return {
      type: 'bar',
      title: this.title,
      xAxisLabel: '관찰 항목',
      yAxisLabel: '빈도',
      data: observations.map(
        (item: { category: string; frequency: string | number }) => ({
          name: typeof item.category === 'string' ? item.category : '',
          value:
            typeof item.frequency === 'number'
              ? item.frequency
              : parseInt(String(item.frequency)) || 0,
        })
      ),
    };
  }

  // 통계 정보 계산
  getStatistics(): {
    count: number;
    sum: number;
    average: number;
    maximum: number;
    minimum: number;
    range: number;
  } | null {
    const chartConfig = this.getChartConfig();
    if (!chartConfig) return null;

    const values = Array.isArray(chartConfig.data)
      ? chartConfig.data.map((item) => item.value)
      : [];
    if (values.length === 0) {
      return {
        count: 0,
        sum: 0,
        average: 0,
        maximum: 0,
        minimum: 0,
        range: 0,
      };
    }
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return {
      count: values.length,
      sum,
      average: Math.round(avg * 100) / 100,
      maximum: max,
      minimum: min,
      range: max - min,
    };
  }

  // JSON 직렬화
  toJSON(): ExperimentData {
    return this.rawData;
  }
}

export class PresentationModel {
  private slides: PresentationSlide[] = [];

  constructor(presentationData?: PresentationData[]) {
    if (presentationData) {
      this.slides = presentationData
        .map((data) => data.content as unknown as PresentationSlide)
        .sort((a, b) => a.order - b.order);
    }
  }

  get slideCount(): number {
    return this.slides.length;
  }

  get allSlides(): PresentationSlide[] {
    return [...this.slides];
  }

  // 슬라이드 추가
  addSlide(slide: Omit<PresentationSlide, 'id' | 'order'>): void {
    const newSlide: PresentationSlide = {
      ...slide,
      id: crypto.randomUUID(),
      order: this.slides.length,
    };
    this.slides.push(newSlide);
  }

  // 슬라이드 순서 변경
  reorderSlides(slideIds: string[]): void {
    const reorderedSlides: PresentationSlide[] = [];
    slideIds.forEach((id, index) => {
      const slide = this.slides.find((s) => s.id === id);
      if (slide) {
        reorderedSlides.push({ ...slide, order: index });
      }
    });
    this.slides = reorderedSlides;
  }

  // 슬라이드 삭제
  removeSlide(slideId: string): void {
    this.slides = this.slides.filter((slide) => slide.id !== slideId);
    // 순서 재정렬
    this.slides.forEach((slide, index) => {
      slide.order = index;
    });
  }

  // 기본 발표 템플릿 생성
  static createDefaultPresentation(
    projectData: ResearchProjectModel
  ): PresentationSlide[] {
    return [
      {
        id: crypto.randomUUID(),
        type: 'title',
        title: projectData.title || '탐구 발표',
        content: `발표자: ${projectData.studentName}`,
        order: 0,
      },
      {
        id: crypto.randomUUID(),
        type: 'content',
        title: '탐구 주제와 질문',
        content: '선택한 주제와 탐구 질문을 소개합니다.',
        order: 1,
      },
      {
        id: crypto.randomUUID(),
        type: 'content',
        title: '가설',
        content: '세운 가설과 그 이유를 설명합니다.',
        order: 2,
      },
      {
        id: crypto.randomUUID(),
        type: 'content',
        title: '실험 방법',
        content: '실험 재료와 절차를 설명합니다.',
        order: 3,
      },
      {
        id: crypto.randomUUID(),
        type: 'chart',
        title: '실험 결과',
        content: '실험 결과를 차트로 보여줍니다.',
        order: 4,
      },
      {
        id: crypto.randomUUID(),
        type: 'conclusion',
        title: '결론 및 느낀점',
        content: '실험을 통해 알게 된 점과 느낀점을 정리합니다.',
        order: 5,
      },
    ];
  }
}
