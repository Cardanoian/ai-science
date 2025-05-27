import { NoteModel } from '../models/NoteModel';
import { Note, CreateNoteData, UpdateNoteData } from '../models/types';
import toast from 'react-hot-toast';

export class NoteController {
  private noteModel: NoteModel;

  constructor() {
    this.noteModel = new NoteModel();
  }

  async getNotesByBoardId(boardId: string): Promise<Note[]> {
    try {
      return await this.noteModel.getByBoardId(boardId);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('노트를 불러오는데 실패했습니다.');
      throw error;
    }
  }

  async createNote(noteData: CreateNoteData): Promise<Note> {
    try {
      const validationErrors = this.validateNoteData(noteData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const note = await this.noteModel.create({
        ...noteData,
        content: noteData.content.trim(),
        author_name: noteData.author_name?.trim() || undefined,
      });

      toast.success('노트가 생성되었습니다!');
      return note;
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('노트 생성에 실패했습니다.');
      throw error;
    }
  }

  async updateNote(id: string, updates: UpdateNoteData): Promise<Note> {
    try {
      if (updates.content !== undefined) {
        updates.content = updates.content.trim();
        if (!updates.content) {
          throw new Error('노트 내용은 필수입니다.');
        }
      }

      const note = await this.noteModel.update(id, updates);
      return note;
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('노트 업데이트에 실패했습니다.');
      throw error;
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      await this.noteModel.delete(id);
      toast.success('노트가 삭제되었습니다!');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('노트 삭제에 실패했습니다.');
      throw error;
    }
  }

  subscribeToRealtimeChanges(
    boardId: string,
    callbacks: {
      onInsert: (note: Note) => void;
      onUpdate: (note: Note) => void;
      onDelete: (noteId: string) => void;
    }
  ) {
    return this.noteModel.subscribeToChanges(boardId, callbacks);
  }

  validateNoteData(data: CreateNoteData): string[] {
    const errors: string[] = [];

    if (!data.content || !data.content.trim()) {
      errors.push('노트 내용은 필수입니다.');
    }

    if (data.content && data.content.length > 1000) {
      errors.push('노트 내용은 1000자를 초과할 수 없습니다.');
    }

    if (!data.board_id) {
      errors.push('보드 ID는 필수입니다.');
    }

    if (data.x_position < 0 || data.y_position < 0) {
      errors.push('노트 위치는 음수일 수 없습니다.');
    }

    if (data.author_name && data.author_name.length > 100) {
      errors.push('작성자 이름은 100자를 초과할 수 없습니다.');
    }

    return errors;
  }

  calculateNotePosition(
    clickX: number,
    clickY: number,
    containerRect: DOMRect
  ): { x: number; y: number } {
    const noteWidth = 256; // 16rem = 256px
    const noteHeight = 128; // 8rem = 128px

    const x = Math.max(0, clickX - containerRect.left - noteWidth / 2);
    const y = Math.max(0, clickY - containerRect.top - noteHeight / 2);

    return { x, y };
  }

  getRandomNoteColor(): string {
    const colors = [
      '#fbbf24', // yellow
      '#fb7185', // pink
      '#60a5fa', // blue
      '#34d399', // green
      '#a78bfa', // purple
      '#f97316', // orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  formatNoteDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return '방금 전';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}분 전`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  }
}
