import type { BoardController } from './BoardController';
import type { NoteController } from './NoteController';
import type { ResearchController } from './ResearchController';

export class AppController {
  public boardController: BoardController;
  public noteController: NoteController;
  public researchController: ResearchController;

  constructor() {
    this.boardController = new BoardController();
    this.noteController = new NoteController();
    this.researchController = new ResearchController();
  }
}
