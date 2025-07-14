import type { Note, DragData } from './types';

export interface NoteExportData {
  content: string;
  author?: string;
  created: string;
  position: number;
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

  get position(): number {
    return this.data.position;
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

  // 색상 유효성 검사
  static isValidColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }

  // 노트 생성 데이터 유효성 검사
  static validateNoteData(content: string, color: string): string[] {
    const errors: string[] = [];

    if (!this.isValidContent(content)) {
      errors.push('노트 내용은 1자 이상 500자 이하로 입력해주세요.');
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

  // 노트 복제
  clone(newPosition?: number): Omit<Note, 'id'> {
    return {
      board_id: this.boardId,
      content: this.content,
      position: newPosition ?? this.position + 20,
      color: this.color,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // 문자열 표현
  toString(): string {
    return `Note(${this.id}): "${this.getPreviewText()}"`;
  }
}
