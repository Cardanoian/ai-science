import { BoardModel } from '../models/BoardModel';
import { Board, CreateBoardData } from '../models/types';
import toast from 'react-hot-toast';

export class BoardController {
  private boardModel: BoardModel;

  constructor() {
    this.boardModel = new BoardModel();
  }

  async getAllBoards(): Promise<Board[]> {
    try {
      return await this.boardModel.getAll();
    } catch (error) {
      console.error('Error fetching boards:', error);
      toast.error('보드를 불러오는데 실패했습니다.');
      throw error;
    }
  }

  async getBoardById(id: string): Promise<Board | null> {
    try {
      return await this.boardModel.getById(id);
    } catch (error) {
      console.error('Error fetching board:', error);
      toast.error('보드를 불러오는데 실패했습니다.');
      throw error;
    }
  }

  async createBoard(boardData: CreateBoardData): Promise<Board> {
    try {
      if (!boardData.title.trim()) {
        throw new Error('보드 제목은 필수입니다.');
      }

      const board = await this.boardModel.create({
        ...boardData,
        title: boardData.title.trim(),
        description: boardData.description?.trim() || undefined,
      });

      toast.success('보드가 생성되었습니다!');
      return board;
    } catch (error) {
      console.error('Error creating board:', error);
      toast.error('보드 생성에 실패했습니다.');
      throw error;
    }
  }

  async updateBoard(
    id: string,
    updates: Partial<CreateBoardData>
  ): Promise<Board> {
    try {
      const board = await this.boardModel.update(id, updates);
      toast.success('보드가 업데이트되었습니다!');
      return board;
    } catch (error) {
      console.error('Error updating board:', error);
      toast.error('보드 업데이트에 실패했습니다.');
      throw error;
    }
  }

  async deleteBoard(id: string): Promise<void> {
    try {
      await this.boardModel.delete(id);
      toast.success('보드가 삭제되었습니다!');
    } catch (error) {
      console.error('Error deleting board:', error);
      toast.error('보드 삭제에 실패했습니다.');
      throw error;
    }
  }

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

    return errors;
  }
}
