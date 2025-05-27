import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

export interface UserProfile {
  id: string;
  display_name?: string;
  role: 'teacher' | 'student';
  school?: string;
  created_at: string;
  updated_at: string;
}

export interface ClassInfo {
  id: string;
  title: string;
  description?: string;
  background_color: string;
  teacher_id: string;
  class_code: string;
  is_active: boolean;
  created_at: string;
}

export class AuthController {
  async signUp(
    email: string,
    password: string,
    displayName: string,
    role: 'teacher' | 'student' = 'teacher'
  ) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // 사용자 프로필 생성
        await this.createUserProfile(data.user.id, displayName, role);
        toast.success('회원가입이 완료되었습니다!');
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error('회원가입 중 오류가 발생했습니다.');
      return { data: null, error };
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('로그인되었습니다!');
      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      return { data: null, error };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success('로그아웃되었습니다.');
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('로그아웃 중 오류가 발생했습니다.');
      return { error };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async createUserProfile(
    userId: string,
    displayName: string,
    role: 'teacher' | 'student',
    school?: string
  ) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            display_name: displayName,
            role,
            school,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      toast.success('프로필이 업데이트되었습니다.');
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error('프로필 업데이트에 실패했습니다.');
      throw error;
    }
  }

  // 인증 상태 변화 구독
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
}
