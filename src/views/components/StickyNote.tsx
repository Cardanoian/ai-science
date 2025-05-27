import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { X, Edit3, Save, Palette, BookOpen } from 'lucide-react';
import { Note, UpdateNoteData } from '../../models/types';
import { ResearchApp } from './ResearchApp';

interface StickyNoteProps {
  note: Note;
  onUpdate: (noteId: string, updates: UpdateNoteData) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
  isReadOnly?: boolean;
}

const COLOR_OPTIONS = [
  { color: '#fbbf24', name: '노란색' },
  { color: '#fb7185', name: '분홍색' },
  { color: '#60a5fa', name: '파란색' },
  { color: '#34d399', name: '초록색' },
  { color: '#a78bfa', name: '보라색' },
  { color: '#f97316', name: '주황색' },
];

export const StickyNote: React.FC<StickyNoteProps> = ({
  note,
  onUpdate,
  onDelete,
  isReadOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(note.content);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showResearchApp, setShowResearchApp] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setContent(note.content);
  }, [note.content]);

  // 색상 피커 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColorPicker]);

  const handleSave = async () => {
    if (content.trim() !== note.content && content.trim()) {
      try {
        await onUpdate(note.id, { content: content.trim() });
      } catch (error) {
        setContent(note.content); // 실패 시 원래 내용으로 되돌리기
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(note.content);
    setIsEditing(false);
  };

  const handleColorChange = async (color: string) => {
    try {
      await onUpdate(note.id, { color });
      setShowColorPicker(false);
    } catch (error) {
      // 에러는 controller에서 처리됨
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragStop = async (e: any, data: any) => {
    setIsDragging(false);

    // 위치가 변경된 경우에만 업데이트
    if (data.x !== note.x_position || data.y !== note.y_position) {
      try {
        await onUpdate(note.id, {
          x_position: Math.max(0, data.x),
          y_position: Math.max(0, data.y),
        });
      } catch (error) {
        // 에러는 controller에서 처리됨
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('이 노트를 삭제하시겠습니까?')) {
      try {
        await onDelete(note.id);
      } catch (error) {
        // 에러는 controller에서 처리됨
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleNoteClick = () => {
    if (!isEditing && !isDragging && !isReadOnly) {
      setShowResearchApp(true);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isReadOnly) {
      setIsEditing(true);
    }
  };

  return (
    <>
      <Draggable
        defaultPosition={{ x: note.x_position, y: note.y_position }}
        onStart={handleDragStart}
        onStop={handleDragStop}
        handle='.drag-handle'
        disabled={isReadOnly}
      >
        <div
          className={`absolute w-64 min-h-32 p-4 rounded-lg shadow-lg select-none transition-all duration-200 ${
            isDragging ? 'scale-105 shadow-xl z-50' : 'hover:shadow-md'
          } ${isReadOnly ? '' : 'cursor-pointer'} ${
            !isEditing ? 'hover:ring-2 hover:ring-blue-300' : ''
          }`}
          style={{
            backgroundColor: note.color,
            filter: isDragging ? 'brightness(1.1)' : 'none',
          }}
          onClick={handleNoteClick}
        >
          {/* 드래그 핸들 */}
          {!isReadOnly && (
            <div className='drag-handle h-6 -m-2 mb-2 cursor-grab active:cursor-grabbing'></div>
          )}

          {/* 도구 모음 */}
          <div className='flex justify-between items-start mb-3'>
            <div className='flex gap-1'>
              {!isReadOnly && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(!isEditing);
                    }}
                    className='p-1.5 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors'
                    title={isEditing ? '저장' : '편집'}
                    disabled={isDragging}
                  >
                    {isEditing ? <Save size={14} /> : <Edit3 size={14} />}
                  </button>

                  <div className='relative' ref={colorPickerRef}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowColorPicker(!showColorPicker);
                      }}
                      className='p-1.5 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors'
                      title='색상 변경'
                      disabled={isDragging}
                    >
                      <Palette size={14} />
                    </button>

                    {showColorPicker && (
                      <div className='absolute top-8 left-0 bg-white p-3 rounded-lg shadow-lg z-10 border'>
                        <div className='grid grid-cols-3 gap-2'>
                          {COLOR_OPTIONS.map(({ color, name }) => (
                            <button
                              key={color}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleColorChange(color);
                              }}
                              className={`w-8 h-8 rounded-full border-2 hover:border-gray-500 transition-colors ${
                                note.color === color
                                  ? 'border-gray-700'
                                  : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                              title={name}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowResearchApp(true);
                    }}
                    className='p-1.5 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors'
                    title='탐구학습 시작'
                    disabled={isDragging}
                  >
                    <BookOpen size={14} />
                  </button>
                </>
              )}
            </div>

            {!isReadOnly && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className='p-1.5 rounded-md hover:bg-red-500 hover:text-white transition-colors'
                title='삭제'
                disabled={isDragging}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* 노트 내용 */}
          {isEditing && !isReadOnly ? (
            <div className='space-y-2'>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className='w-full h-24 resize-none border-none outline-none bg-transparent text-sm placeholder-gray-600'
                placeholder='노트 내용을 입력하세요...'
                maxLength={1000}
              />
              <div className='flex justify-end gap-2'>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel();
                  }}
                  className='px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors'
                >
                  취소
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className='px-2 py-1 text-xs bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors'
                  disabled={!content.trim()}
                >
                  저장
                </button>
              </div>
            </div>
          ) : (
            <div
              className='whitespace-pre-wrap text-sm min-h-20 leading-relaxed'
              onDoubleClick={handleDoubleClick}
              title={isReadOnly ? '' : '클릭: 탐구학습 시작 | 더블클릭: 편집'}
            >
              {note.content}
            </div>
          )}

          {/* 탐구학습 시작 안내 */}
          {!isEditing && !isReadOnly && (
            <div className='mt-2 p-2 bg-blue-100 bg-opacity-50 rounded text-xs text-blue-800'>
              <BookOpen size={12} className='inline mr-1' />
              클릭하여 탐구학습 시작
            </div>
          )}

          {/* 작성자 및 시간 정보 */}
          <div className='text-xs opacity-70 mt-3 space-y-1'>
            {note.author_name && (
              <div className='font-medium'>- {note.author_name}</div>
            )}
            <div className='text-right'>
              {new Date(note.created_at).toLocaleString('ko-KR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      </Draggable>

      {/* 탐구학습 앱 */}
      {showResearchApp && (
        <ResearchApp
          noteId={note.id}
          noteTitle={note.content}
          onClose={() => setShowResearchApp(false)}
        />
      )}
    </>
  );
};
