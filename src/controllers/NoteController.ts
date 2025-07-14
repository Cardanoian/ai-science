import { supabase } from '../lib/supabase';
import type { Note, CreateNoteData, UpdateNoteData } from '../models/types';
import toast from 'react-hot-toast';
import type { RealtimeChannel } from '@supabase/supabase-js';

export class NoteController {
  private realtimeSubscription: RealtimeChannel | null = null;

  // 보드별 노트 조회
  async getNotesByBoardId(boardId: string): Promise<Note[]> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('board_id', boardId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('노트를 불러오는데 실패했습니다.');
      throw error;
    }
  }

  // 노트 생성
  async createNote(noteData: CreateNoteData): Promise<Note> {
    try {
      const validationErrors = this.validateNoteData(noteData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            ...noteData,
            content: noteData.content.trim(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('노트가 생성되었습니다!');
      return data;
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('노트 생성에 실패했습니다.');
      throw error;
    }
  }

  // 노트 업데이트
  async updateNote(id: string, updates: UpdateNoteData): Promise<Note> {
    try {
      if (updates.content !== undefined) {
        updates.content = updates.content.trim();
        if (!updates.content) {
          throw new Error('노트 내용은 필수입니다.');
        }
      }

      const { data, error } = await supabase
        .from('notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('노트 업데이트에 실패했습니다.');
      throw error;
    }
  }

  // 노트 삭제
  async deleteNote(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);

      if (error) throw error;

      toast.success('노트가 삭제되었습니다!');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('노트 삭제에 실패했습니다.');
      throw error;
    }
  }

  // 실시간 변경사항 구독
  subscribeToRealtimeChanges(
    boardId: string,
    callbacks: {
      onInsert: (note: Note) => void;
      onUpdate: (note: Note) => void;
      onDelete: (noteId: string) => void;
    }
  ) {
    // 기존 구독 해제
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
    }

    // 새 구독 설정
    this.realtimeSubscription = supabase
      .channel('notes_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notes',
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          callbacks.onInsert(payload.new as Note);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          callbacks.onUpdate(payload.new as Note);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notes',
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          callbacks.onDelete(payload.old.id);
        }
      )
      .subscribe();

    // 구독 해제 함수 반환
    return () => {
      if (this.realtimeSubscription) {
        this.realtimeSubscription.unsubscribe();
        this.realtimeSubscription = null;
      }
    };
  }

  // 노트 데이터 유효성 검사
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

    return errors;
  }

  // 랜덤 노트 색상 반환
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

  // 노트 생성 시간 포맷
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
