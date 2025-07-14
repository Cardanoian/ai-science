import { useAppController } from '../../contexts/AppControllerContext';
import React, { useState, useRef, useEffect } from 'react';
import { X, Edit3, Save, Palette } from 'lucide-react';
import { colorPalette } from '../../constants/colorPalette';
import type { Note } from '../../models/types';

interface NoteCardProps {
  note: Note;
  onUpdate: (noteId: string, updates: Partial<Note>) => void;
  onDelete: (noteId: string) => void;
  onClick?: () => void;
  isReadOnly?: boolean;
  teacherId: string;
  draggable?: boolean; // draggable 속성 추가
  onDragStart?: (e: React.DragEvent, id: string) => void; // 드래그 이벤트 추가
  onDragOver?: (e: React.DragEvent, id: string) => void; // 드래그 오버 이벤트 추가
  onDrop?: (e: React.DragEvent, id: string) => void; // 드롭 이벤트 추가
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onUpdate,
  onDelete,
  onClick,
  isReadOnly = false,
  teacherId,
  draggable = false, // 기본값 false
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const appController = useAppController();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(note.content);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 편집 모드 시작
  const handleEditStart = () => {
    if (isReadOnly) return;
    setIsEditing(true);
    setShowMenu(false);
  };

  // 편집 모드 종료 및 저장
  const handleEditSave = () => {
    if (content.trim() !== note.content) {
      onUpdate(note.id, { content: content.trim() });
    }
    setIsEditing(false);
  };

  // 편집 취소
  const handleEditCancel = () => {
    setContent(note.content);
    setIsEditing(false);
  };

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  // 편집 모드 시 텍스트에어리어 포커스
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // 색상 변경
  const handleColorChange = (newColor: string) => {
    onUpdate(note.id, { color: newColor });
    setShowColorPicker(false);
    setShowMenu(false);
  };

  // 삭제 확인
  const handleDelete = () => {
    if (confirm('이 노트를 삭제하시겠습니까?')) {
      onDelete(note.id);
    }
    setShowMenu(false);
  };

  // 시간 포맷팅
  const getTimeAgo = () => {
    const now = new Date();
    const updated = new Date(note.updated_at);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `${diffDays}일 전`;
    if (diffHours > 0) return `${diffHours}시간 전`;
    if (diffMins > 0) return `${diffMins}분 전`;
    return '방금 전';
  };

  return (
    <div
      ref={cardRef}
      className={`w-64 min-h-32 p-4 rounded-xl shadow-lg border-2 select-none ${
        isEditing ? 'ring-2 ring-blue-500' : ''
      } ${draggable ? 'cursor-grab hover:shadow-xl' : ''}`} // 드래그 가능할 때만 커서 변경
      style={{
        backgroundColor: note.color,
        borderColor:
          note.color === '#fbbf24'
            ? '#f59e0b'
            : note.color === '#60a5fa'
            ? '#3b82f6'
            : note.color === '#34d399'
            ? '#10b981'
            : note.color === '#f472b6'
            ? '#ec4899'
            : note.color === '#a78bfa'
            ? '#8b5cf6'
            : note.color === '#fb923c'
            ? '#ea580c'
            : note.color === '#06d6a0'
            ? '#059669'
            : '#ef4444',
      }}
      draggable={draggable} // draggable 속성 적용
      onDragStart={(e) => onDragStart?.(e, note.id)}
      onDragOver={(e) => onDragOver?.(e, note.id)}
      onDrop={(e) => onDrop?.(e, note.id)}
    >
      {/* 헤더 */}
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center space-x-1'>
          {/* {!isReadOnly && <Move className='w-3 h-3 text-gray-600 opacity-60' />} */}
        </div>

        {!isReadOnly && (
          <div className='flex items-center space-x-1'>
            {isEditing ? (
              <div className='flex space-x-1'>
                <button
                  onClick={handleEditSave}
                  className='p-1 text-green-600 hover:text-green-800 transition-colors'
                  title='저장 (Ctrl+Enter)'
                >
                  <Save className='w-3 h-3' />
                </button>
                <button
                  onClick={handleEditCancel}
                  className='p-1 text-red-600 hover:text-red-800 transition-colors'
                  title='취소 (Esc)'
                >
                  <X className='w-3 h-3' />
                </button>
              </div>
            ) : (
              <div className='relative'>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className='p-1 text-gray-600 hover:text-gray-800 transition-colors opacity-60 hover:opacity-100'
                >
                  <div className='w-1 h-1 bg-current rounded-full'></div>
                  <div className='w-1 h-1 bg-current rounded-full my-0.5'></div>
                  <div className='w-1 h-1 bg-current rounded-full'></div>
                </button>

                {showMenu && (
                  <div className='absolute right-0 top-6 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-30'>
                    <button
                      onClick={handleEditStart}
                      className='w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2'
                    >
                      <Edit3 className='w-3 h-3' />
                      <span>편집</span>
                    </button>
                    <button
                      onClick={() => setShowColorPicker(true)}
                      className='w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2'
                    >
                      <Palette className='w-3 h-3' />
                      <span>색상</span>
                    </button>
                    {appController.authController.getUserId() == teacherId && (
                      <>
                        <hr className='my-1' />
                        <button
                          onClick={handleDelete}
                          className='w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2'
                        >
                          <X className='w-3 h-3' />
                          <span>삭제</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 내용 */}
      <div className='mb-3'>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className='select-text w-full h-20 p-2 text-sm bg-white bg-opacity-80 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='노트 내용을 입력하세요...'
            maxLength={500}
          />
        ) : (
          <div className='select-none text-sm text-gray-800 whitespace-pre-wrap break-words'>
            {note.content || (
              <span className='text-gray-500 italic'>
                내용을 입력하려면 클릭하세요
              </span>
            )}
          </div>
        )}
      </div>

      {/* 푸터 */}

      <div>
        <div className='flex items-center justify-between text-xs text-gray-600'>
          <span>{getTimeAgo()}</span>
          {/* {!isReadOnly && !note.content && (
            <div className='flex items-center space-x-1 text-blue-600 animate-pulse'>
              <Zap className='w-3 h-3' />
              <span>클릭으로 탐구 시작</span>
            </div>
          )} */}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className='mt-2 w-full py-1 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors'
        >
          탐구하기
        </button>
      </div>

      {/* 색상 피커 */}
      {showColorPicker && (
        <div className='absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20'>
          <p className='text-xs font-medium text-gray-700 mb-2'>색상 선택</p>
          <div className='grid grid-cols-4 gap-2'>
            {colorPalette.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorChange(color.value)}
                className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                  note.color === color.value
                    ? 'border-gray-800 scale-110'
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
          <button
            onClick={() => setShowColorPicker(false)}
            className='w-full mt-2 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors'
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
};

export default NoteCard;
