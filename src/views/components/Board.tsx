import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Users,
  Share,
  ArrowLeft,
  Settings,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';
import { StickyNote } from './StickyNote';
import { NoteController } from '../../controllers/NoteController';
import { AppController } from '../../controllers/AppController';
import { Note, CreateNoteData, Board as BoardType } from '../../models/types';
import toast from 'react-hot-toast';

interface BoardProps {
  board: BoardType;
  appController: AppController;
  onBackToHome: () => void;
  classCode?: string;
  isTeacher?: boolean;
}

export const Board: React.FC<BoardProps> = ({
  board,
  appController,
  onBackToHome,
  classCode,
  isTeacher = false,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [showAuthorInput, setShowAuthorInput] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showClassCode, setShowClassCode] = useState(false);
  const boardAreaRef = useRef<HTMLDivElement>(null);
  const noteController = appController.noteController;

  useEffect(() => {
    loadNotes();
    setupRealtimeSubscription();

    // 로컬 스토리지에서 작성자 이름 복원
    const savedAuthor = localStorage.getItem('padlet_author_name');
    if (savedAuthor) {
      setAuthorName(savedAuthor);
    }

    return () => {
      // cleanup은 setupRealtimeSubscription에서 반환된 함수로 처리
    };
  }, [board.id]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await noteController.getNotesByBoardId(board.id);
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    return noteController.subscribeToRealtimeChanges(board.id, {
      onInsert: (note: Note) => {
        setNotes((prev) => [...prev, note]);
      },
      onUpdate: (note: Note) => {
        setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
      },
      onDelete: (noteId: string) => {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      },
    });
  };

  const handleAddNote = async (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget || !boardAreaRef.current) return;

    const rect = boardAreaRef.current.getBoundingClientRect();
    const { x, y } = noteController.calculateNotePosition(
      e.clientX,
      e.clientY,
      rect
    );

    const noteData: CreateNoteData = {
      board_id: board.id,
      content: '새 노트...',
      x_position: x,
      y_position: y,
      color: noteController.getRandomNoteColor(),
      author_name: authorName || undefined,
    };

    try {
      await noteController.createNote(noteData);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleUpdateNote = async (noteId: string, updates: any) => {
    try {
      await noteController.updateNote(noteId, updates);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await noteController.deleteNote(noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleAuthorNameSave = (name: string) => {
    setAuthorName(name);
    localStorage.setItem('padlet_author_name', name);
    setShowAuthorInput(false);
  };

  const copyClassCode = async () => {
    if (classCode) {
      try {
        await navigator.clipboard.writeText(classCode);
        toast.success('수업 코드가 복사되었습니다!');
      } catch (error) {
        toast.error('복사에 실패했습니다.');
      }
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className='min-h-screen'
      style={{ backgroundColor: board.background_color }}
    >
      {/* 헤더 */}
      <div className='bg-white shadow-sm border-b sticky top-0 z-40'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <button
                onClick={onBackToHome}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                title='돌아가기'
              >
                <ArrowLeft size={20} />
              </button>

              <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  {board.title}
                </h1>
                {board.description && (
                  <p className='text-gray-600 mt-1'>{board.description}</p>
                )}
              </div>
            </div>

            <div className='flex items-center gap-4'>
              {/* 수업 코드 표시 */}
              {classCode && (
                <div className='flex items-center gap-2'>
                  <div className='bg-blue-50 px-3 py-2 rounded-lg'>
                    <div className='flex items-center gap-2'>
                      <span className='text-blue-700 text-sm font-medium'>
                        수업코드:
                      </span>
                      <span className='font-mono font-bold text-blue-900'>
                        {showClassCode ? classCode : '••••••'}
                      </span>
                      <button
                        onClick={() => setShowClassCode(!showClassCode)}
                        className='text-blue-600 hover:text-blue-700'
                        title={showClassCode ? '숨기기' : '보이기'}
                      >
                        {showClassCode ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                      </button>
                      <button
                        onClick={copyClassCode}
                        className='text-blue-600 hover:text-blue-700'
                        title='복사'
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 노트 개수 표시 */}
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <Users size={18} />
                <span>{notes.length}개 노트</span>
              </div>

              {/* 작성자 이름 설정 */}
              <div className='flex items-center gap-2'>
                {showAuthorInput ? (
                  <div className='flex items-center gap-2'>
                    <input
                      type='text'
                      defaultValue={authorName}
                      onBlur={(e) => handleAuthorNameSave(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAuthorNameSave(e.currentTarget.value);
                        } else if (e.key === 'Escape') {
                          setShowAuthorInput(false);
                        }
                      }}
                      placeholder='이름을 입력하세요...'
                      className='px-3 py-1 border rounded-md text-sm w-32'
                      autoFocus
                      maxLength={100}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAuthorInput(true)}
                    className='px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm transition-colors'
                  >
                    {authorName || '이름 설정'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 보드 영역 */}
      <div
        ref={boardAreaRef}
        className='relative min-h-screen p-8 cursor-crosshair'
        onClick={handleAddNote}
        style={{ height: 'calc(100vh - 80px)' }}
      >
        {/* 안내 메시지 */}
        {notes.length === 0 && (
          <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
            <div className='text-center text-gray-500'>
              <Plus size={48} className='mx-auto mb-4 opacity-50' />
              <p className='text-lg font-medium mb-2'>
                첫 번째 노트를 추가해보세요
              </p>
              <p className='text-sm'>화면을 클릭하면 노트가 생성됩니다</p>
              <p className='text-xs mt-2 text-gray-400'>
                노트를 클릭하면 탐구학습을 시작할 수 있습니다
              </p>
            </div>
          </div>
        )}

        {/* 스티키 노트들 */}
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
            isReadOnly={!isTeacher && note.author_name !== authorName}
          />
        ))}
      </div>
    </div>
  );
};
