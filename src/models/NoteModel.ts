import type { Note, NotePosition, DragData } from './types';

export interface NoteExportData {
  content: string;
  author?: string;
  created: string;
  position: NotePosition;
  color: string;
}

export class NoteModel {
  private data: Note;
  private dragState: DragData;

  constructor(noteData: Note) {
    this.data = { ...noteData };
    this.dragState = {
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
    };
  }

  // Getter methods
  get id(): string {
    return this.data.id;
  }

  get boardId(): string {
    return this.data.board_id;
  }

  get content(): string {
    return this.data.content;
  }

  get position(): NotePosition {
    return {
      x: this.data.x_position,
      y: this.data.y_position,
    };
  }

  get color(): string {
    return this.data.color;
  }

  get createdAt(): Date {
    return new Date(this.data.created_at);
  }

  get updatedAt(): Date {
    return new Date(this.data.updated_at);
  }

  get isDragging(): boolean {
    return this.dragState.isDragging;
  }

  get rawData(): Note {
    return { ...this.data };
  }

  // 노트 내용 유효성 검사
  static isValidContent(content: string): boolean {
    return content.trim().length > 0 && content.trim().length <= 500;
  }

  // 위치 유효성 검사 (보드 영역 내부)
  static isValidPosition(
    position: NotePosition,
    boardWidth: number = 1200,
    boardHeight: number = 800
  ): boolean {
    return (
      position.x >= 0 &&
      position.x <= boardWidth - 200 && // 노트 폭 고려
      position.y >= 0 &&
      position.y <= boardHeight - 150
    ); // 노트 높이 고려
  }

  // 색상 유효성 검사
  static isValidColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }

  // 노트 생성 데이터 유효성 검사
  static validateNoteData(
    content: string,
    position: NotePosition,
    color: string
  ): string[] {
    const errors: string[] = [];

    if (!this.isValidContent(content)) {
      errors.push('노트 내용은 1자 이상 500자 이하로 입력해주세요.');
    }

    if (!this.isValidPosition(position)) {
      errors.push('노트 위치가 보드 영역을 벗어났습니다.');
    }

    if (!this.isValidColor(color)) {
      errors.push('올바른 색상 코드를 선택해주세요.');
    }

    return errors;
  }

  // 노트 내용 업데이트
  updateContent(newContent: string): NoteModel {
    if (!NoteModel.isValidContent(newContent)) {
      throw new Error('유효하지 않은 노트 내용입니다.');
    }

    const updatedData = {
      ...this.data,
      content: newContent.trim(),
      updated_at: new Date().toISOString(),
    };

    return new NoteModel(updatedData);
  }

  // 노트 위치 업데이트
  updatePosition(newPosition: NotePosition): NoteModel {
    if (!NoteModel.isValidPosition(newPosition)) {
      throw new Error('유효하지 않은 노트 위치입니다.');
    }

    const updatedData = {
      ...this.data,
      x_position: Math.round(newPosition.x),
      y_position: Math.round(newPosition.y),
      updated_at: new Date().toISOString(),
    };

    return new NoteModel(updatedData);
  }

  // 노트 색상 변경
  updateColor(newColor: string): NoteModel {
    if (!NoteModel.isValidColor(newColor)) {
      throw new Error('유효하지 않은 색상입니다.');
    }

    const updatedData = {
      ...this.data,
      color: newColor,
      updated_at: new Date().toISOString(),
    };

    return new NoteModel(updatedData);
  }

  // 드래그 시작
  startDrag(mousePosition: NotePosition): NoteModel {
    const newModel = new NoteModel(this.data);
    newModel.dragState = {
      isDragging: true,
      dragOffset: {
        x: mousePosition.x - this.position.x,
        y: mousePosition.y - this.position.y,
      },
    };
    return newModel;
  }

  // 드래그 중
  updateDrag(mousePosition: NotePosition): NoteModel {
    if (!this.isDragging) return this;

    const newPosition = {
      x: mousePosition.x - this.dragState.dragOffset.x,
      y: mousePosition.y - this.dragState.dragOffset.y,
    };

    return this.updatePosition(newPosition);
  }

  // 드래그 종료
  endDrag(): NoteModel {
    const newModel = new NoteModel(this.data);
    newModel.dragState = {
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
    };
    return newModel;
  }

  // 다른 노트와의 충돌 검사
  isCollidingWith(otherNote: NoteModel, threshold: number = 20): boolean {
    const distance = Math.sqrt(
      Math.pow(this.position.x - otherNote.position.x, 2) +
        Math.pow(this.position.y - otherNote.position.y, 2)
    );
    return distance < threshold;
  }

  // 노트가 특정 영역 내에 있는지 확인
  isInArea(area: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): boolean {
    return (
      this.position.x >= area.x &&
      this.position.x <= area.x + area.width &&
      this.position.y >= area.y &&
      this.position.y <= area.y + area.height
    );
  }

  // 노트 크기 계산 (내용에 따라)
  calculateSize(): { width: number; height: number } {
    const baseWidth = 200;
    const baseHeight = 150;
    const contentLength = this.content.length;

    // 내용이 많을수록 약간 더 큰 노트
    const extraHeight = Math.min(Math.floor(contentLength / 50) * 20, 100);

    return {
      width: baseWidth,
      height: baseHeight + extraHeight,
    };
  }

  // 노트 미리보기 텍스트 생성
  getPreviewText(maxLength: number = 50): string {
    if (this.content.length <= maxLength) {
      return this.content;
    }
    return this.content.substring(0, maxLength) + '...';
  }

  // 노트 생성 시간 포맷
  getTimeAgo(): string {
    const now = new Date();
    const created = this.createdAt;
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}일 전`;
    } else if (diffHours > 0) {
      return `${diffHours}시간 전`;
    } else if (diffMins > 0) {
      return `${diffMins}분 전`;
    } else {
      return '방금 전';
    }
  }

  // 노트 검색 (내용 기반)
  matches(searchTerm: string): boolean {
    const term = searchTerm.toLowerCase();
    return this.content.toLowerCase().includes(term);
  }

  // 노트 색상 팔레트
  static getColorPalette(): { name: string; value: string }[] {
    return [
      { name: '노란색', value: '#fbbf24' },
      { name: '하늘색', value: '#60a5fa' },
      { name: '연두색', value: '#34d399' },
      { name: '분홍색', value: '#f472b6' },
      { name: '보라색', value: '#a78bfa' },
      { name: '주황색', value: '#fb923c' },
      { name: '민트색', value: '#06d6a0' },
      { name: '코랄색', value: '#ff6b6b' },
    ];
  }

  // 랜덤 색상 선택
  static getRandomColor(): string {
    const colors = this.getColorPalette();
    return colors[Math.floor(Math.random() * colors.length)].value;
  }

  // 랜덤 위치 생성
  static getRandomPosition(
    boardWidth: number = 1200,
    boardHeight: number = 800
  ): NotePosition {
    return {
      x: Math.floor(Math.random() * (boardWidth - 200)),
      y: Math.floor(Math.random() * (boardHeight - 150)),
    };
  }

  // 노트를 격자에 맞춰 정렬
  snapToGrid(gridSize: number = 20): NoteModel {
    const snappedPosition = {
      x: Math.round(this.position.x / gridSize) * gridSize,
      y: Math.round(this.position.y / gridSize) * gridSize,
    };
    return this.updatePosition(snappedPosition);
  }

  // 노트 복제
  clone(newPosition?: NotePosition): Omit<Note, 'id'> {
    return {
      board_id: this.boardId,
      content: this.content,
      x_position: newPosition?.x ?? this.position.x + 20,
      y_position: newPosition?.y ?? this.position.y + 20,
      color: this.color,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // 내보내기용 데이터
  getExportData(): NoteExportData {
    return {
      content: this.content,
      created: this.createdAt.toISOString(),
      position: this.position,
      color: this.color,
    };
  }

  // JSON 직렬화
  toJSON(): Note {
    return this.rawData;
  }

  // 문자열 표현
  toString(): string {
    return `Note(${this.id}): "${this.getPreviewText()}"`;
  }
}
