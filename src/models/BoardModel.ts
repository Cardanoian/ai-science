import type {
  Board,
  CreateClassFormData,
  ClassStatistics,
  Note,
  ResearchProject,
} from './types';

export class BoardModel {
  private data: Board;

  constructor(boardData: Board) {
    this.data = { ...boardData };
  }

  // Getter methods
  get id(): string {
    return this.data.id;
  }

  get title(): string {
    return this.data.title;
  }

  get description(): string | undefined {
    return this.data.description;
  }

  get backgroundColor(): string {
    return this.data.background_color;
  }

  get teacherId(): string {
    return this.data.teacher_id;
  }

  get classCode(): string {
    return this.data.class_code;
  }

  get isActive(): boolean {
    return this.data.is_active;
  }

  get createdAt(): Date {
    return new Date(this.data.created_at);
  }

  get updatedAt(): Date {
    return new Date(this.data.updated_at);
  }

  // 전체 데이터 반환
  get rawData(): Board {
    return { ...this.data };
  }

  // 수업 코드 유효성 검사
  static isValidClassCode(code: string): boolean {
    return /^\d{6}$/.test(code);
  }

  // 수업 제목 유효성 검사
  static isValidTitle(title: string): boolean {
    return title.trim().length >= 2 && title.trim().length <= 100;
  }

  // 배경색 유효성 검사
  static isValidBackgroundColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }

  // 폼 데이터 유효성 검사
  static validateCreateForm(formData: CreateClassFormData): string[] {
    const errors: string[] = [];

    if (!this.isValidTitle(formData.title)) {
      errors.push('수업명은 2자 이상 100자 이하로 입력해주세요.');
    }

    if (formData.description && formData.description.length > 500) {
      errors.push('수업 설명은 500자 이하로 입력해주세요.');
    }

    if (!this.isValidBackgroundColor(formData.backgroundColor)) {
      errors.push('올바른 색상 코드를 선택해주세요.');
    }

    return errors;
  }

  // 수업 상태 확인
  isOwner(userId: string): boolean {
    return this.data.teacher_id === userId;
  }

  // 수업이 진행 중인지 확인
  isInProgress(): boolean {
    return this.data.is_active;
  }

  // 수업 생성일로부터 경과된 일수
  getDaysFromCreation(): number {
    const now = new Date();
    const created = new Date(this.data.created_at);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // 수업 정보 업데이트
  updateInfo(
    updates: Partial<Pick<Board, 'title' | 'description' | 'background_color'>>
  ): BoardModel {
    const updatedData = {
      ...this.data,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return new BoardModel(updatedData);
  }

  // 수업 활성화/비활성화
  toggleActive(): BoardModel {
    const updatedData: Board = {
      ...this.data,
      is_active: !this.data.is_active,
      updated_at: new Date().toISOString(),
    };
    return new BoardModel(updatedData);
  }

  // 수업 요약 정보 생성
  getSummary(): string {
    const daysActive = this.getDaysFromCreation();
    const status = this.isActive ? '진행중' : '종료됨';
    return `${this.title} (${status}, ${daysActive}일 경과)`;
  }

  // 수업 공유 URL 생성
  getShareUrl(baseUrl: string = window.location.origin): string {
    return `${baseUrl}?join=${this.classCode}`;
  }

  // 수업 통계 계산 (참가자 관련 로직 제거)
  calculateStatistics(
    notes: Note[],
    projects: ResearchProject[]
  ): ClassStatistics {
    const completedProjects = projects.filter(
      (p) => p.current_step >= 6
    ).length;
    const averageProgress =
      projects.length > 0
        ? (projects.reduce((sum, p) => sum + p.current_step / 6, 0) /
            projects.length) *
          100
        : 0;

    return {
      totalStudents: 0,
      activeStudents: 0,
      totalNotes: notes.length,
      researchProjects: projects.length,
      completedProjects,
      averageProgress: Math.round(averageProgress),
    };
  }

  // 수업 내보내기 데이터 생성
  getExportData(notes: Note[], projects: ResearchProject[]) {
    return {
      classInfo: {
        title: this.title,
        description: this.description,
        code: this.classCode,
        created: this.createdAt,
        duration: this.getDaysFromCreation(),
      },
      summary: {
        totalNotes: notes.length,
        totalProjects: projects.length,
        averageProgress:
          projects.length > 0
            ? projects.reduce((sum, p) => sum + p.current_step, 0) /
              projects.length
            : 0,
      },
      notes: notes.map((note) => ({
        content: note.content,
        created: note.created_at,
        position: { x: note.x_position, y: note.y_position },
      })),
      projects: projects.map((project) => ({
        title: project.title,
        student: project.student_name,
        step: project.current_step,
        created: project.created_at,
      })),
    };
  }

  // 수업 색상 팔레트 제안
  static getColorPalette(): {
    name: string;
    value: string;
    description: string;
  }[] {
    return [
      {
        name: '하늘색',
        value: '#87CEEB',
        description: '차분하고 집중하기 좋은 색상',
      },
      {
        name: '연두색',
        value: '#98FB98',
        description: '활기차고 창의적인 분위기',
      },
      { name: '연보라', value: '#DDA0DD', description: '편안하고 따뜻한 느낌' },
      {
        name: '연분홍',
        value: '#FFB6C1',
        description: '부드럽고 친근한 분위기',
      },
      { name: '연노랑', value: '#FFFFE0', description: '밝고 긍정적인 에너지' },
      {
        name: '연회색',
        value: '#F5F5F5',
        description: '깔끔하고 모던한 스타일',
      },
      {
        name: '연주황',
        value: '#FFDAB9',
        description: '따뜻하고 활동적인 분위기',
      },
      { name: '연청록', value: '#AFEEEE', description: '신선하고 시원한 느낌' },
    ];
  }

  // 수업명 자동 제안
  static suggestTitles(subject?: string): string[] {
    const base = [
      '과학 탐구 여행',
      '함께하는 실험실',
      '창의 과학 교실',
      '스마트 실험실',
      '미래 과학자들',
    ];

    if (subject) {
      return [
        `${subject} 탐구반`,
        `${subject} 실험실`,
        `${subject}와 함께`,
        `재미있는 ${subject}`,
        `${subject} 마스터`,
      ];
    }

    return base;
  }

  // JSON 직렬화
  toJSON(): Board {
    return this.rawData;
  }

  // 문자열 표현
  toString(): string {
    return `Board(${this.id}): ${this.title} [${this.classCode}]`;
  }
}
