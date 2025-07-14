import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Share2, Palette, Grid3X3, Zap, Plus } from 'lucide-react';
import { useAppController } from '../contexts/AppControllerContext';
import type { Board, Note } from '../models/types';
import { colorPalette } from '../constants/colorPalette';
import NoteCard from './components/NoteCard';
import CreateNoteModal from './components/CreateNoteModal';
import type { AppController } from '../controllers';

interface BoardViewProps {
  board: Board;
  onNavigate: {
    toWelcome: () => void;
    toDashboard: () => void;
    toResearch: (board: Board, noteId: string) => void;
  };
}

const BoardView: React.FC<BoardViewProps> = ({ board, onNavigate }) => {
  const appController: AppController = useAppController();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('#fbbf24');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showGrid, setShowGrid] = useState(true); // 격자 기본 활성화
  const [showCreateModal, setShowCreateModal] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  // 드래그 앤 드롭 상태
  const dragItem = useRef<number | null>(null); // 드래그 중인 노트의 인덱스
  const dragOverItem = useRef<number | null>(null); // 드롭될 위치의 노트 인덱스

  // 데이터 로드
  useEffect(() => {
    const loadBoardData = async () => {
      try {
        setIsLoading(true);
        const notesData = await appController.noteController.getNotesByBoardId(
          board.id
        );
        // position을 기준으로 정렬하여 초기 순서 설정
        setNotes(notesData.sort((a, b) => a.position - b.position));
      } catch (error) {
        console.error('Failed to load board data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBoardData();
  }, [appController, board.id]);

  // 실시간 탐구 노트 변경 구독
  useEffect(() => {
    const unsubscribe = appController.noteController.subscribeToRealtimeChanges(
      board.id,
      {
        onInsert: (note: Note) => {
          setNotes((prev) =>
            [...prev, note].sort((a, b) => a.position - b.position)
          );
        },
        onUpdate: (note: Note) => {
          setNotes((prev) =>
            prev
              .map((n) => (n.id === note.id ? note : n))
              .sort((a, b) => a.position - b.position)
          );
        },
        onDelete: (noteId: string) => {
          setNotes((prev) =>
            prev
              .filter((n) => n.id !== noteId)
              .sort((a, b) => a.position - b.position)
          );
        },
      }
    );

    return unsubscribe;
  }, [appController.noteController, board.id]);

  // + 버튼 클릭으로 탐구 노트 생성
  const handleCreateNote = () => {
    setShowCreateModal(true);
  };

  const handleConfirmCreate = async (content: string, color: string) => {
    try {
      // 새 노트는 position을 현재 노트 개수로 설정하여 마지막에 추가되도록 함
      await appController.noteController.createNote({
        board_id: board.id,
        content,
        position: notes.length, // 새로운 노트의 순서 (마지막)
        color,
      });
    } catch (error) {
      console.error('Failed to create note:', error);
    }
    setShowCreateModal(false);
  };

  const handleCancelCreate = () => {
    setShowCreateModal(false);
  };

  // 탐구 노트 업데이트 (position 제외)
  const handleNoteUpdate = async (noteId: string, updates: Partial<Note>) => {
    try {
      // position 업데이트는 드래그 앤 드롭 로직에서 처리
      const { ...restUpdates } = updates;
      await appController.noteController.updateNote(noteId, restUpdates);
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  // 탐구 노트 삭제
  const handleNoteDelete = async (noteId: string) => {
    try {
      await appController.noteController.deleteNote(noteId);
      // setNotes는 subscribeToRealtimeChanges에서 처리되므로 여기서는 필요 없음
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

  // 드래그 시작
  const handleDragStart = useCallback(
    (e: React.DragEvent, position: number) => {
      dragItem.current = position;
      e.dataTransfer.effectAllowed = 'move';
      // 드래그 이미지 설정 (선택 사항)
      const img = new Image();
      img.src =
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // 투명 이미지
      e.dataTransfer.setDragImage(img, 0, 0);
    },
    []
  );

  // 드래그 오버
  const handleDragOver = useCallback((e: React.DragEvent, position: number) => {
    e.preventDefault();
    dragOverItem.current = position;
  }, []);

  // 드롭
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const draggedIndex = dragItem.current;
      const droppedIndex = dragOverItem.current;

      if (
        draggedIndex === null ||
        droppedIndex === null ||
        draggedIndex === droppedIndex
      ) {
        return;
      }

      const newNotes = [...notes];
      const [draggedNote] = newNotes.splice(draggedIndex, 1);
      newNotes.splice(droppedIndex, 0, draggedNote);

      // 순서 변경 후 position 업데이트
      const updatedNotes = newNotes.map((note, index) => ({
        ...note,
        position: index,
      }));

      setNotes(updatedNotes);

      // 데이터베이스 업데이트
      try {
        // 모든 노트의 position을 업데이트
        await Promise.all(
          updatedNotes.map((note) =>
            appController.noteController.updateNote(note.id, {
              position: note.position,
            })
          )
        );
      } catch (error) {
        console.error('Failed to update note positions:', error);
        // 에러 발생 시 이전 상태로 롤백 (선택 사항)
        // setNotes(notes);
      }

      dragItem.current = null;
      dragOverItem.current = null;
    },
    [notes, appController.noteController]
  );

  if (isLoading) {
    return (
      <div className='h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>수업판을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-screen bg-gray-50'>
      <CreateNoteModal
        show={showCreateModal}
        initialColor={selectedColor}
        onCancel={handleCancelCreate}
        onConfirm={handleConfirmCreate}
      />
      {/* 헤더 */}
      <header className='bg-white shadow-sm border-b sticky top-0 z-40'>
        <div className='container mx-auto px-4 sm:px-6 md:px-8 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              {appController.authController.getUserId() ? (
                <button
                  onClick={onNavigate.toDashboard}
                  className='p-2 text-gray-600 hover:text-gray-800 transition-colors'
                  title='대시보드로 돌아가기'
                >
                  <ArrowLeft className='w-5 h-5' />
                </button>
              ) : (
                <button
                  onClick={onNavigate.toWelcome}
                  className='p-2 text-gray-600 hover:text-gray-800 transition-colors'
                  title='처음으로 돌아가기'
                >
                  <ArrowLeft className='w-5 h-5' />
                </button>
              )}

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
                  <span>탐구 : {notes.length}개</span>
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
                  <div className='absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-56 z-10'>
                    <div className='grid grid-cols-4 gap-3'>
                      {colorPalette.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => {
                            setSelectedColor(color.value);
                            setShowColorPicker(false);
                          }}
                          className={`w-10 h-10 rounded border-2 transition-all ${
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
            </div>
          </div>
        </div>
      </header>

      {/* 안내 메시지 */}
      {notes.length === 0 && (
        <div className='container mx-auto px-4 sm:px-6 md:px-8 py-8'>
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
                <span>+ 버튼: 새 탐구 생성</span>
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
      <div className='flex-1 min-h-0 relative overflow-hidden'>
        <div
          ref={boardRef}
          className={`w-full h-full min-h-full p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-min ${
            showGrid ? 'bg-grid-pattern' : ''
          } overflow-y-auto justify-items-center`}
          style={{
            backgroundColor: board.background_color,
            backgroundImage: showGrid
              ? 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)'
              : 'none',
            backgroundSize: showGrid ? '20px 20px' : 'auto',
          }}
        >
          {/* 탐구 노트들 */}
          {notes.map((note, index) => (
            <NoteCard
              key={note.id}
              note={note}
              onUpdate={handleNoteUpdate}
              onDelete={handleNoteDelete}
              onClick={() => handleNoteClick(note.id)}
              isReadOnly={false}
              teacherId={board.teacher_id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={handleDrop}
            />
          ))}

          {/* 탐구 노트 생성 플로팅 버튼 */}
          <button
            onClick={handleCreateNote}
            className='fixed bottom-14 sm:bottom-18 right-6 sm:right-10 z-50 bg-gradient-to-br from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-full shadow-xl ring-4 ring-white w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center transition-transform transform hover:scale-110'
            title='탐구 노트 생성'
          >
            <Plus className='w-10 h-10' />
          </button>
        </div>
      </div>

      {/* 하단 정보 바 */}
      <div className='bg-white border-t border-gray-200 px-4 sm:px-6 md:px-8 py-2'>
        <div className='container mx-auto flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600'>
          <div className='flex items-center space-x-6'>
            <span>총 {notes.length}개의 노트</span>
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
