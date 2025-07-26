export interface Board {
  id: string;
  title: string;
  description?: string;
  background_color: string;
  teacher_id: string;
  class_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBoardData {
  title: string;
  description?: string;
  background_color: string;
  teacher_id: string;
  class_code: string;
  is_active?: boolean;
}

export interface Note {
  id: string;
  board_id: string;
  content: string;
  position: number;
  color: string;
  created_at: string;
  updated_at: string;
}

// 노트 생성/수정용 타입
export interface CreateNoteData {
  board_id: string;
  content: string;
  position: number;
  color: string;
}

export interface UpdateNoteData {
  content?: string;
  position?: number;
  color?: string;
}

export interface ResearchProject {
  id: string;
  note_id: string;
  title?: string;
  student_name: string;
  current_step: number;
  all_steps?: Record<number, ResearchStepContent | null>;
  created_at: string;
  updated_at: string;
}

export interface ResearchStep {
  id: string;
  project_id: string;
  step_number: number;
  step_title: string;
  content: ResearchStepContent;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PresentationData {
  id: string;
  project_id: string;
  slide_order: number;
  slide_type: string;
  content: Record<string, unknown>;
  created_at: string;
}

export interface DragData {
  isDragging: boolean;
  dragOffset: { x: number; y: number };
}

export interface CreateClassFormData {
  title: string;
  description: string;
  backgroundColor: string;
}

// 탐구학습 관련 상세 타입
export interface ResearchStepContent {
  // 1단계: 탐구 주제 찾기
  interests?: string[];
  selectedTopic?: string;
  topicReason?: string;

  // 2단계: 탐구 질문과 가설
  observations?: string[];
  researchQuestion?: string;
  hypothesis?: {
    condition?: string;
    prediction?: string;
  };
  hypothesisReason?: string;

  // 3단계: 실험 계획하기
  materials?: string[];
  procedure?: string[];
  variables?: {
    independent: string;
    dependent: string;
    controlled: string[];
  };
  safetyPrecautions?: string[];

  // 4단계: 결과 정리 및 결론
  experimentResults?: string;
  chartData?: ChartData;
  hypothesisResult?: 'supported' | 'rejected' | 'inconclusive';
  hypothesisExplanation?: string;
  conclusion?: string;

  // 5단계: 탐구 발표 준비
  presentationTitle?: string;
  presentationSlides?: { [key: string]: string };
  presentationScript?: string;
  generatedPresentationHtml?: string;

  // 6단계: 성찰하기
  whatLearned?: string;
  challenges?: string;
  newLearnings?: string;
  nextResearch?: string;
  aiExperience?: {
    positive: string;
    improvement: string;
  };
}

export interface PresentationSlide {
  id: string;
  type: 'title' | 'content' | 'image' | 'chart' | 'conclusion';
  title: string;
  content: string;
  order: number;
  data?: unknown;
}

// 차트 데이터 타입
export interface ChartDataPoint {
  name: string;
  value: number;
  category?: string;
}

export interface ChartSeries {
  name: string;
  color: string;
}

export interface ChartData {
  id: string;
  type: 'bar' | 'line' | 'pie';
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  series: ChartSeries[];
  data: Array<{
    name: string;
    [seriesName: string]: number[] | string;
  }>;
}

// 기존 데이터와의 호환성을 위한 레거시 타입
export interface LegacyChartData {
  id: string;
  type: 'bar' | 'line' | 'pie';
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  data: ChartDataPoint[];
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter';
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  data: ChartDataPoint[];
}

export interface ResearchTopicRecommendation {
  title: string;
  description: string;
  difficulty: string;
  materials: string[];
  safetyNote: string;
  concepts: string[];
}

// 학급 통계 타입
export interface ClassStatistics {
  totalStudents: number;
  activeStudents: number;
  totalNotes: number;
  researchProjects: number;
  completedProjects: number;
  averageProgress: number;
}
