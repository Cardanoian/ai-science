import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

export interface UserProfile {
  id: string;
  email?: string;
  display_name?: string;
  role: 'teacher' | 'student';
  school?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export class AuthController {
  private listeners: ((state: AuthState) => void)[] = [];
  private currentState: AuthState = {
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
  };

  constructor() {
    this.initializeAuth();
  }

  public getUserId = () => this.currentState.user?.id;

  // 인증 상태 초기화
  private async initializeAuth() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const profile = await this.getUserProfile(user.id);
        this.updateState({
          user,
          profile,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        this.updateState({
          user: null,
          profile: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }

      // 인증 상태 변화 구독
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const profile = await this.getUserProfile(session.user.id);
          this.updateState({
            user: session.user,
            profile,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          this.updateState({
            user: null,
            profile: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      });
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.updateState({
        user: null,
        profile: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }

  // 상태 업데이트 및 리스너 알림
  private updateState(newState: Partial<AuthState>) {
    this.currentState = { ...this.currentState, ...newState };
    this.listeners.forEach((listener) => listener(this.currentState));
  }

  // 상태 변화 구독
  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    // 현재 상태 즉시 전달
    listener(this.currentState);

    // 구독 해제 함수 반환
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // 현재 상태 반환
  getState(): AuthState {
    return this.currentState;
  }

  // 회원가입
  async signUp(
    email: string,
    password: string,
    displayName: string,
    role: 'teacher' | 'student' = 'teacher',
    school?: string
  ) {
    try {
      this.updateState({ isLoading: true });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await this.createUserProfile(data.user.id, displayName, role, school);
        toast.success('회원가입이 완료되었습니다!');
      }

      return { data, error: null };
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '회원가입 중 오류가 발생했습니다.';
      toast.error(errorMessage);
      return { data: null, error };
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  // 로그인
  async signIn(email: string, password: string) {
    try {
      this.updateState({ isLoading: true });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('로그인되었습니다!');
      return { data, error: null };
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      const errorMessage =
        error instanceof Error ? error.message : '로그인에 실패했습니다.';
      toast.error(errorMessage);
      return { data: null, error };
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  // 로그아웃
  async signOut() {
    try {
      this.updateState({ isLoading: true });

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success('로그아웃되었습니다.');
      return { error: null };
    } catch (error: unknown) {
      console.error('Sign out error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '로그아웃 중 오류가 발생했습니다.';
      toast.error(errorMessage);
      return { error };
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  // 현재 사용자 조회
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }

  // 사용자 프로필 조회
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // 사용자 프로필 생성
  async createUserProfile(
    userId: string,
    displayName: string,
    role: 'teacher' | 'student',
    school?: string
  ): Promise<UserProfile> {
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

  // 사용자 프로필 업데이트
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

      // 현재 상태 업데이트
      if (this.currentState.profile?.id === userId) {
        this.updateState({
          profile: { ...this.currentState.profile, ...data },
        });
      }

      toast.success('프로필이 업데이트되었습니다.');
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error('프로필 업데이트에 실패했습니다.');
      throw error;
    }
  }
}
