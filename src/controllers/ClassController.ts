// src/controllers/ClassController.ts
import { supabase } from '../lib/supabase';
import { BoardController } from './BoardController';
import toast from 'react-hot-toast';

export interface CreateClassData {
  title: string;
  description?: string;
  background_color?: string;
}

export class ClassController {
  private boardController: BoardController;

  constructor() {
    this.boardController = new BoardController();
  }

  async getMyClasses(teacherId: string): Promise<ClassInfo[]> {
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
      console.error('Error fetching classes:', error);
      toast.error('수업 목록을 불러오는데 실패했습니다.');
      return [];
    }
  }

  async createClass(
    teacherId: string,
    classData: CreateClassData
  ): Promise<ClassInfo | null> {
    try {
      const { data, error } = await supabase
        .from('boards')
        .insert([
          {
            ...classData,
            teacher_id: teacherId,
            background_color: classData.background_color || '#f3f4f6',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('새 수업이 생성되었습니다!');
      return data;
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error('수업 생성에 실패했습니다.');
      return null;
    }
  }

  async getClassByCode(classCode: string): Promise<ClassInfo | null> {
    try {
      const { data, error } = await supabase.rpc('get_board_by_class_code', {
        code: classCode,
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error('수업 코드를 찾을 수 없습니다.');
        return null;
      }

      return data[0];
    } catch (error) {
      console.error('Error fetching class by code:', error);
      toast.error('수업 코드 확인 중 오류가 발생했습니다.');
      return null;
    }
  }

  async joinClassByCode(
    classCode: string,
    studentName?: string
  ): Promise<ClassInfo | null> {
    try {
      const { data, error } = await supabase.rpc('join_class_by_code', {
        code: classCode,
        student_name_param: studentName,
      });

      if (error) throw error;

      const result = typeof data === 'string' ? JSON.parse(data) : data;

      if (result.success) {
        toast.success(result.message);
        return result.board;
      } else {
        toast.error(result.message);
        return null;
      }
    } catch (error) {
      console.error('Error joining class:', error);
      toast.error('수업 참여 중 오류가 발생했습니다.');
      return null;
    }
  }

  async updateClass(
    classId: string,
    updates: Partial<CreateClassData>
  ): Promise<ClassInfo | null> {
    try {
      const { data, error } = await supabase
        .from('boards')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', classId)
        .select()
        .single();

      if (error) throw error;

      toast.success('수업 정보가 업데이트되었습니다.');
      return data;
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error('수업 정보 업데이트에 실패했습니다.');
      return null;
    }
  }

  async deleteClass(classId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('boards')
        .update({ is_active: false })
        .eq('id', classId);

      if (error) throw error;

      toast.success('수업이 삭제되었습니다.');
      return true;
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('수업 삭제에 실패했습니다.');
      return false;
    }
  }

  async getClassParticipants(classId: string) {
    try {
      const { data, error } = await supabase
        .from('class_participants')
        .select(
          `
          id,
          student_name,
          joined_at,
          user_profiles (
            display_name,
            role
          )
        `
        )
        .eq('board_id', classId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  }

  generateShareUrl(classCode: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}?join=${classCode}`;
  }

  async copyClassCode(classCode: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(classCode);
      toast.success('수업 코드가 클립보드에 복사되었습니다!');
    } catch (error) {
      console.error('Failed to copy class code:', error);
      toast.error('클립보드 복사에 실패했습니다.');
    }
  }

  async copyShareUrl(classCode: string): Promise<void> {
    try {
      const shareUrl = this.generateShareUrl(classCode);
      await navigator.clipboard.writeText(shareUrl);
      toast.success('공유 링크가 클립보드에 복사되었습니다!');
    } catch (error) {
      console.error('Failed to copy share URL:', error);
      toast.error('클립보드 복사에 실패했습니다.');
    }
  }
}
