export interface User {
  id: string;
  email?: string;
  display_name?: string;
  role: 'teacher' | 'student';
  school?: string;
  created_at: string;
  updated_at: string;
}

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
  x_position: number;
  y_position: number;
  color: string;
  created_at: string;
  updated_at: string;
}

// 노트 생성/수정용 타입
export interface CreateNoteData {
  board_id: string;
  content: string;
  x_position: number;
  y_position: number;
  color: string;
}

export interface UpdateNoteData {
  content?: string;
  x_position?: number;
  y_position?: number;
  color?: string;
}

export interface ResearchProject {
  id: string;
  note_id: string;
  title?: string;
  student_name: string;
  current_step: number;
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

export interface ExperimentData {
  id: string;
  project_id: string;
  data_type: string;
  title: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface ResearchQA {
  id: string;
  project_id: string;
  step_number: number;
  question: string;
  answer?: string;
  ai_feedback?: string;
  created_at: string;
}

export interface PresentationData {
  id: string;
  project_id: string;
  slide_order: number;
  slide_type: string;
  content: Record<string, unknown>;
  created_at: string;
}

// UI 상태 관련 타입
export interface AppState {
  currentView: 'welcome' | 'dashboard' | 'board' | 'research';
  user: User | null;
  currentBoard: Board | null;
  isLoading: boolean;
  error: string | null;
}

export interface NotePosition {
  x: number;
  y: number;
}

export interface DragData {
  isDragging: boolean;
  dragOffset: NotePosition;
}

// 모달 상태 타입
export interface ModalState {
  login: boolean;
  joinClass: boolean;
  createClass: boolean;
  classDetail: boolean;
}

// 폼 데이터 타입
export interface LoginFormData {
  email: string;
  password: string;
  displayName?: string;
  school?: string;
}

export interface JoinClassFormData {
  classCode: string;
  studentName: string;
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
  hypothesis?: string;

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
  experimentResults?: unknown[];
  dataAnalysis?: string;
  conclusion?: string;

  // 5단계: 탐구 발표 준비
  presentationSlides?: PresentationSlide[];
  presentationScript?: string;

  // 6단계: 성찰하기
  whatLearned?: string;
  challenges?: string;
  improvements?: string;
  nextResearch?: string;
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

export interface ChartData {
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

// AI 관련 타입
export interface AITopicRecommendation {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  materials: string[];
  safetyNote: string;
  estimatedTime: string;
}

export interface AIFeedback {
  step: number;
  content: string;
  suggestions: string[];
  encouragement: string;
  nextSteps: string[];
  timestamp: string;
}

// 에러 타입
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
}

// 실시간 이벤트 타입
export interface RealtimeEvent {
  type:
    | 'note_created'
    | 'note_updated'
    | 'note_deleted'
    | 'user_joined'
    | 'user_left';
  payload: unknown;
  timestamp: string;
  userId?: string;
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

// 내보내기 데이터 타입
export interface ExportData {
  format: 'pdf' | 'docx' | 'json';
  content: {
    projectInfo: ResearchProject;
    steps: ResearchStep[];
    data: ExperimentData[];
    presentations: PresentationData[];
  };
}

// 설정 타입
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en';
  autoSave: boolean;
  notifications: boolean;
  aiAssistance: boolean;
}

// 알림 타입
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// 노트 내보내기 데이터 타입
export interface NoteExportData {
  content: string;
  created: string;
  position: NotePosition;
  color: string;
}
