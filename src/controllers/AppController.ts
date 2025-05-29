import { AuthController } from './AuthController';
import { BoardController } from './BoardController';
import { NoteController } from './NoteController';
import { ResearchController } from './ResearchController';
import { ClassController } from './ClassController';

export class AppController {
  public authController: AuthController;
  public boardController: BoardController;
  public noteController: NoteController;
  public researchController: ResearchController;
  public classController: ClassController;

  constructor() {
    this.authController = new AuthController();
    this.boardController = new BoardController();
    this.noteController = new NoteController();
    this.researchController = new ResearchController();
    this.classController = new ClassController();
  }

  // 앱 초기화
  async initialize() {
    try {
      // 인증 상태 확인
      const user = await this.authController.getCurrentUser();
      if (user) {
        // 사용자가 로그인되어 있다면 필요한 데이터 로드
        await this.loadUserData(user.id);
      }
      return { success: true, user };
    } catch (error) {
      console.error('App initialization failed:', error);
      return { success: false, error };
    }
  }

  // 사용자 데이터 로드
  private async loadUserData(userId: string) {
    try {
      const profile = await this.authController.getUserProfile(userId);
      if (profile?.role === 'teacher') {
        await this.classController.getMyClasses(userId);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  // 앱 정리
  cleanup() {
    // 이벤트 리스너 정리, 구독 해제 등
  }
}
