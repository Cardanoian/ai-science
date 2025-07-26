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

  // Google OAuth 로그인 (교사 전용)
  async signInWithGoogle() {
    try {
      this.updateState({ isLoading: true });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: unknown) {
      console.error('Google sign in error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Google 로그인 중 오류가 발생했습니다.';
      toast.error(errorMessage);
      return { data: null, error };
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  // 프로필 완성 여부 확인
  async isProfileComplete(userId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId);
      return !!(profile && profile.display_name);
    } catch (error) {
      console.error('Error checking profile completion:', error);
      return false;
    }
  }

  // Google 로그인 후 교사 프로필 완성
  async completeTeacherProfile(
    userId: string,
    displayName: string,
    school?: string
  ) {
    try {
      this.updateState({ isLoading: true });

      // 기존 프로필이 있는지 확인
      const existingProfile = await this.getUserProfile(userId);

      let profileData;
      if (existingProfile) {
        // 기존 프로필 업데이트
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            display_name: displayName,
            school,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
          .select()
          .single();

        if (error) throw error;
        profileData = data;
      } else {
        // 새 프로필 생성
        const { data, error } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: userId,
              display_name: displayName,
              role: 'teacher',
              school,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        profileData = data;
      }

      // 현재 상태 업데이트
      this.updateState({
        profile: profileData,
      });

      toast.success('프로필이 완성되었습니다!');
      return { data: profileData, error: null };
    } catch (error: unknown) {
      console.error('Error completing teacher profile:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '프로필 완성 중 오류가 발생했습니다.';
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
