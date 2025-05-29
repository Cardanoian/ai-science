import { supabase } from '../lib/supabase';
import type { Board } from '../models/types';
import toast from 'react-hot-toast';

export interface CreateClassData {
  title: string;
  description?: string;
  background_color?: string;
}

export interface ClassParticipant {
  id: string;
  board_id: string;
  user_id?: string;
  student_name: string;
  joined_at: string;
}

export interface Statistics {
  totalStudents: number;
  activeStudents: number;
  totalNotes: number;
  researchProjects: number;
  completedProjects: number;
  averageProgress: number;
}

export class ClassController {
  // 교사의 수업 목록 조회
  async getMyClasses(teacherId: string): Promise<Board[]> {
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

  // 수업 생성
  async createClass(
    teacherId: string,
    classData: CreateClassData
  ): Promise<Board | null> {
    try {
      // 6자리 수업 코드 생성 (중복 체크)
      let classCode = '';
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        classCode = Math.floor(100000 + Math.random() * 900000).toString();
        const { data: existing } = await supabase
          .from('boards')
          .select('id')
          .eq('class_code', classCode)
          .single();

        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        throw new Error('수업 코드 생성에 실패했습니다.');
      }

      const { data, error } = await supabase
        .from('boards')
        .insert([
          {
            ...classData,
            teacher_id: teacherId,
            class_code: classCode,
            background_color: classData.background_color || '#f3f4f6',
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // 교사도 자동으로 class_participants에 등록
      if (data && data.id) {
        await supabase.from('class_participants').insert([
          {
            board_id: data.id,
            user_id: teacherId,
            student_name: '교사', // 필요시 teacher의 이름으로 변경
          },
        ]);
      }

      toast.success(`새 수업이 생성되었습니다! (코드: ${classCode})`);
      return data;
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error('수업 생성에 실패했습니다.');
      return null;
    }
  }

  // 수업 코드로 조회
  async getClassByCode(classCode: string): Promise<Board | null> {
    try {
      if (!/^\d{6}$/.test(classCode)) {
        toast.error('올바른 6자리 수업 코드를 입력해주세요.');
        return null;
      }

      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('class_code', classCode)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('해당 수업 코드를 찾을 수 없습니다.');
        } else {
          throw error;
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching class by code:', error);
      toast.error('수업 코드 확인 중 오류가 발생했습니다.');
      return null;
    }
  }

  // 수업 참여
  async joinClass(
    classCode: string,
    studentName: string,
    userId?: string
  ): Promise<Board | null> {
    try {
      const classData = await this.getClassByCode(classCode);
      if (!classData) {
        return null;
      }

      // 이미 참여했는지 확인
      const { data: existingParticipant } = await supabase
        .from('class_participants')
        .select('id')
        .eq('board_id', classData.id)
        .eq('student_name', studentName.trim())
        .single();

      if (existingParticipant) {
        toast.success('이미 참여 중인 수업입니다.');
        return classData;
      }

      // 참가자 추가
      const { error: participantError } = await supabase
        .from('class_participants')
        .insert([
          {
            board_id: classData.id,
            user_id: userId || null,
            student_name: studentName.trim(),
          },
        ]);

      if (participantError) throw participantError;

      toast.success(`"${classData.title}" 수업에 참여했습니다!`);
      return classData;
    } catch (error) {
      console.error('Error joining class:', error);
      toast.error('수업 참여 중 오류가 발생했습니다.');
      return null;
    }
  }

  // 수업 정보 업데이트
  async updateClass(
    classId: string,
    updates: Partial<CreateClassData>
  ): Promise<Board | null> {
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

  // 수업 삭제 (논리적 삭제)
  async deleteClass(classId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('boards')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
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

  // 수업 참가자 목록 조회
  async getClassParticipants(classId: string): Promise<ClassParticipant[]> {
    try {
      const { data, error } = await supabase
        .from('class_participants')
        .select(
          `
          id,
          board_id,
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

  // 수업 통계 조회
  async getClassStatistics(classId: string): Promise<Statistics> {
    try {
      const [participants, notes, projects] = await Promise.all([
        this.getClassParticipants(classId),
        supabase.from('notes').select('id').eq('board_id', classId),
        supabase
          .from('research_projects')
          .select('id, current_step')
          .in(
            'note_id',
            (
              await supabase.from('notes').select('id').eq('board_id', classId)
            ).data?.map((n) => n.id) || []
          ),
      ]);

      const totalStudents = participants.length;
      const totalNotes = notes.data?.length || 0;
      const totalProjects = projects.data?.length || 0;
      const completedProjects =
        projects.data?.filter((p) => p.current_step >= 6).length || 0;
      const averageProgress =
        totalProjects > 0
          ? Math.round(
              ((projects.data?.reduce((sum, p) => sum + p.current_step, 0) ||
                0) /
                totalProjects /
                6) *
                100
            )
          : 0;

      return {
        totalStudents,
        activeStudents: totalStudents, // 임시로 전체 학생 수와 동일
        totalNotes,
        researchProjects: totalProjects,
        completedProjects,
        averageProgress,
      };
    } catch (error) {
      console.error('Error fetching class statistics:', error);
      return {
        totalStudents: 0,
        activeStudents: 0,
        totalNotes: 0,
        researchProjects: 0,
        completedProjects: 0,
        averageProgress: 0,
      };
    }
  }

  // 공유 URL 생성
  generateShareUrl(classCode: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}?join=${classCode}`;
  }

  // 수업 코드 클립보드 복사
  async copyClassCode(classCode: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(classCode);
      toast.success('수업 코드가 클립보드에 복사되었습니다!');
    } catch (error) {
      console.error('Failed to copy class code:', error);
      toast.error('클립보드 복사에 실패했습니다.');
    }
  }

  // 공유 링크 클립보드 복사
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

  // QR 코드 데이터 생성
  generateQRCodeData(classCode: string, className: string): string {
    return JSON.stringify({
      type: 'class_join',
      code: classCode,
      name: className,
      url: this.generateShareUrl(classCode),
    });
  }

  // 수업 코드 유효성 검사
  static isValidClassCode(code: string): boolean {
    return /^\d{6}$/.test(code);
  }
}
