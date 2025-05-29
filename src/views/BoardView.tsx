// src/views/BoardView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Users, Share2, Palette, Grid3X3, Zap } from 'lucide-react';
import type { AppController } from '../controllers/AppController';
import type { AuthState } from '../controllers/AuthController';
import type { Board, Note, ClassParticipant } from '../models/types';
import NoteCard from './components/NoteCard';

interface BoardViewProps {
  appController: AppController;
  authState: AuthState;
  board: Board;
  onNavigate: {
    toDashboard: () => void;
    toResearch: (board: Board, noteId: string) => void;
  };
}

const BoardView: React.FC<BoardViewProps> = ({
  appController,
  authState,
  board,
  onNavigate,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [participants, setParticipants] = useState<ClassParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('#fbbf24');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  // 노트 색상 팔레트
  const colorPalette = [
    { name: '노란색', value: '#fbbf24' },
    { name: '하늘색', value: '#60a5fa' },
    { name: '연두색', value: '#34d399' },
    { name: '분홍색', value: '#f472b6' },
    { name: '보라색', value: '#a78bfa' },
    { name: '주황색', value: '#fb923c' },
    { name: '민트색', value: '#06d6a0' },
    { name: '코랄색', value: '#ff6b6b' },
  ];

  // 데이터 로드
  useEffect(() => {
    const loadBoardData = async () => {
      try {
        setIsLoading(true);

        // 노트 로드
        const notesData = await appController.noteController.getNotesByBoardId(
          board.id
        );
        setNotes(notesData);

        // 참가자 로드
        const participantsData =
          await appController.classController.getClassParticipants(board.id);
        setParticipants(participantsData);
      } catch (error) {
        console.error('Failed to load board data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBoardData();
  }, [appController, board.id]);

  // 실시간 노트 변경 구독
  useEffect(() => {
    const unsubscribe = appController.noteController.subscribeToRealtimeChanges(
      board.id,
      {
        onInsert: (note: Note) => {
          setNotes((prev) => [...prev, note]);
        },
        onUpdate: (note: Note) => {
          setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
        },
        onDelete: (noteId: string) => {
          setNotes((prev) => prev.filter((n) => n.id !== noteId));
        },
      }
    );

    return unsubscribe;
  }, [appController.noteController, board.id]);

  // + 버튼 클릭으로 노트 생성
  const handleCreateNote = async () => {
    if (!boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    // 중앙 좌표를 보드 내부 좌표계로 계산
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const position = appController.noteController.calculateNotePosition(
      centerX,
      centerY,
      rect
    );

    try {
      await appController.noteController.createNote({
        board_id: board.id,
        content: '새 노트',
        x_position: position.x,
        y_position: position.y,
        color: selectedColor,
        author_name: authState.profile?.display_name || '익명',
      });
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  // 노트 업데이트
  const handleNoteUpdate = async (noteId: string, updates: Partial<Note>) => {
    try {
      await appController.noteController.updateNote(noteId, updates);
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  // 노트 삭제
  const handleNoteDelete = async (noteId: string) => {
    try {
      await appController.noteController.deleteNote(noteId);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  // 노트 클릭으로 탐구 시작
  const handleNoteClick = (noteId: string) => {
    onNavigate.toResearch(board, noteId);
  };

  // 공유 링크 복사
  const handleShare = () => {
    appController.classController.copyShareUrl(board.class_code);
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>수업판을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* 헤더 */}
      <header className='bg-white shadow-sm border-b sticky top-0 z-40'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <button
                onClick={onNavigate.toDashboard}
                className='p-2 text-gray-600 hover:text-gray-800 transition-colors'
                title='대시보드로 돌아가기'
              >
                <ArrowLeft className='w-5 h-5' />
              </button>

              <div>
                <h1 className='text-xl font-bold text-gray-800'>
                  {board.title}
                </h1>
                <div className='flex items-center space-x-4 text-sm text-gray-600'>
                  <span>
                    수업 코드:{' '}
                    <code className='font-mono font-bold text-blue-600'>
                      {board.class_code}
                    </code>
                  </span>
                  <span>참여자: {participants.length}명</span>
                  <span>노트: {notes.length}개</span>
                </div>
              </div>
            </div>

            <div className='flex items-center space-x-3'>
              {/* 색상 선택 */}
              <div className='relative'>
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className='p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                  title='노트 색상 선택'
                >
                  <div className='flex items-center space-x-2'>
                    <div
                      className='w-4 h-4 rounded'
                      style={{ backgroundColor: selectedColor }}
                    />
                    <Palette className='w-4 h-4 text-gray-600' />
                  </div>
                </button>

                {showColorPicker && (
                  <div className='absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10'>
                    <div className='grid grid-cols-4 gap-2'>
                      {colorPalette.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => {
                            setSelectedColor(color.value);
                            setShowColorPicker(false);
                          }}
                          className={`w-8 h-8 rounded border-2 transition-all ${
                            selectedColor === color.value
                              ? 'border-gray-800 scale-110'
                              : 'border-gray-300 hover:border-gray-500'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 격자 토글 */}
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 border border-gray-300 rounded-lg transition-colors ${
                  showGrid
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
                title='격자 표시'
              >
                <Grid3X3 className='w-4 h-4' />
              </button>

              {/* 공유 */}
              <button
                onClick={handleShare}
                className='p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                title='공유 링크 복사'
              >
                <Share2 className='w-4 h-4 text-gray-600' />
              </button>

              {/* 참가자 목록 */}
              <div className='flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg'>
                <Users className='w-4 h-4 text-gray-600' />
                <span className='text-sm font-medium text-gray-700'>
                  {participants.length}
                </span>
                <div className='flex -space-x-1'>
                  {participants.slice(0, 3).map((participant) => (
                    <div
                      key={participant.id}
                      className='w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white'
                      title={participant.student_name}
                    >
                      {participant.student_name.charAt(0)}
                    </div>
                  ))}
                  {participants.length > 3 && (
                    <div className='w-6 h-6 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white'>
                      +{participants.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 안내 메시지 */}
      {notes.length === 0 && (
        <div className='container mx-auto px-4 py-8'>
          <div className='bg-blue-50 border border-blue-200 rounded-xl p-8 text-center'>
            <Zap className='w-12 h-12 text-blue-500 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-blue-900 mb-2'>
              첫 번째 탐구 노트를 만들어보세요!
            </h3>
            <p className='text-blue-700 mb-4'>
              오른쪽 아래 <b>+</b> 버튼을 눌러 새로운 노트를 생성하세요.
              <br />
              노트를 <b>클릭</b>하면 AI와 함께 탐구를 시작할 수 있어요.
            </p>
            <div className='flex items-center justify-center space-x-6 text-sm text-blue-600'>
              <div className='flex items-center space-x-2'>
                <div className='w-3 h-3 bg-blue-500 rounded'></div>
                <span>+ 버튼: 노트 생성</span>
              </div>
              <div className='flex items-center space-x-2'>
                <div className='w-3 h-3 bg-purple-500 rounded'></div>
                <span>노트 클릭: 탐구 시작</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 보드 영역 */}
      <div
        className='relative overflow-hidden'
        style={{ minHeight: 'calc(100vh - 120px)' }}
      >
        <div
          ref={boardRef}
          className={`relative w-full h-full min-h-screen ${
            showGrid ? 'bg-grid-pattern' : ''
          }`}
          style={{
            backgroundColor: board.background_color,
            backgroundImage: showGrid
              ? 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)'
              : 'none',
            backgroundSize: showGrid ? '20px 20px' : 'auto',
          }}
        >
          {/* 노트들 */}
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onUpdate={handleNoteUpdate}
              onDelete={handleNoteDelete}
              onClick={() => handleNoteClick(note.id)}
              isReadOnly={false}
            />
          ))}

          {/* 노트 생성 플로팅 버튼 */}
          <button
            onClick={handleCreateNote}
            className='fixed bottom-10 right-10 z-50 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-4xl transition-all'
            title='노트 생성'
            style={{ boxShadow: '0 4px 24px rgba(59,130,246,0.2)' }}
          >
            +
          </button>
        </div>
      </div>

      {/* 하단 정보 바 */}
      <div className='bg-white border-t border-gray-200 px-4 py-2'>
        <div className='container mx-auto flex items-center justify-between text-sm text-gray-600'>
          <div className='flex items-center space-x-6'>
            <span>총 {notes.length}개의 노트</span>
            <span>활성 사용자: {participants.length}명</span>
            <span>
              진행 중인 탐구:{' '}
              {notes.filter((n) => n.content.includes('탐구')).length}개
            </span>
          </div>
          <div className='flex items-center space-x-4'>
            <span>마지막 업데이트: 방금 전</span>
            <div className='flex items-center space-x-1'>
              <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
              <span>실시간 동기화</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardView;
