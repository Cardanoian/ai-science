import { supabase } from '../lib/supabase';
import type { Board, CreateBoardData } from '../models/types';
import toast from 'react-hot-toast';

export class BoardController {
  // 모든 보드 조회
  async getAllBoards(): Promise<Board[]> {
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching boards:', error);
      toast.error('보드를 불러오는데 실패했습니다.');
      throw error;
    }
  }

  // 보드 ID로 조회
  async getBoardById(id: string): Promise<Board | null> {
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching board:', error);
      toast.error('보드를 불러오는데 실패했습니다.');
      throw error;
    }
  }

  // 교사의 보드들 조회
  async getBoardsByTeacher(teacherId: string): Promise<Board[]> {
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching teacher boards:', error);
      toast.error('보드를 불러오는데 실패했습니다.');
      throw error;
    }
  }

  // 보드 생성
  async createBoard(boardData: CreateBoardData): Promise<Board> {
    try {
      const validationErrors = this.validateBoardData(boardData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // 클래스 코드 생성
      const classCode = this.generateClassCode();

      const { data, error } = await supabase
        .from('boards')
        .insert([
          {
            ...boardData,
            class_code: classCode,
            title: boardData.title.trim(),
            description: boardData.description?.trim() || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('보드가 생성되었습니다!');
      return data;
    } catch (error) {
      console.error('Error creating board:', error);
      toast.error('보드 생성에 실패했습니다.');
      throw error;
    }
  }

  // 보드 업데이트
  async updateBoard(
    id: string,
    updates: Partial<CreateBoardData>
  ): Promise<Board> {
    try {
      const { data, error } = await supabase
        .from('boards')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('보드가 업데이트되었습니다!');
      return data;
    } catch (error) {
      console.error('Error updating board:', error);
      toast.error('보드 업데이트에 실패했습니다.');
      throw error;
    }
  }

  // 보드 삭제 (논리적 삭제)
  async deleteBoard(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('boards')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('보드가 삭제되었습니다!');
    } catch (error) {
      console.error('Error deleting board:', error);
      toast.error('보드 삭제에 실패했습니다.');
      throw error;
    }
  }

  // 클래스 코드로 보드 조회
  async getBoardByClassCode(classCode: string): Promise<Board | null> {
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('class_code', classCode)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching board by class code:', error);
      return null;
    }
  }

  // 보드 데이터 유효성 검사
  validateBoardData(data: CreateBoardData): string[] {
    const errors: string[] = [];

    if (!data.title || !data.title.trim()) {
      errors.push('보드 제목은 필수입니다.');
    }

    if (data.title && data.title.trim().length > 255) {
      errors.push('보드 제목은 255자를 초과할 수 없습니다.');
    }

    if (data.description && data.description.length > 1000) {
      errors.push('보드 설명은 1000자를 초과할 수 없습니다.');
    }

    if (!data.teacher_id) {
      errors.push('교사 ID는 필수입니다.');
    }

    return errors;
  }

  // 6자리 클래스 코드 생성
  private generateClassCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // 클래스 코드 유효성 검사
  static isValidClassCode(code: string): boolean {
    return /^\d{6}$/.test(code);
  }
}
