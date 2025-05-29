// src/components/AIChat.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  MessageCircle,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Copy,
} from 'lucide-react';
import type { ResearchStepContent } from '../../models/types';

interface Message {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  messages: Message[];
  onSendMessage: (message: string, context?: ResearchStepContent) => void;
  onClose: () => void;
  currentStep: number;
  stepData: ResearchStepContent;
}

const AIChat: React.FC<AIChatProps> = ({
  messages,
  onSendMessage,
  onClose,
  currentStep,
  stepData,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 단계별 추천 질문
  const stepQuestions = {
    1: [
      '이 주제가 왜 흥미로운가요?',
      '다른 주제 추천해주세요',
      '주제와 관련된 과학 개념은 무엇인가요?',
      '실험 가능한 주제인지 확인해주세요',
    ],
    2: [
      '이 가설이 적절한가요?',
      '탐구 질문을 더 구체적으로 만들어주세요',
      '가설을 검증할 방법은 무엇인가요?',
      '예상되는 결과는 무엇인가요?',
    ],
    3: [
      '실험 계획이 안전한가요?',
      '변인 설정이 올바른가요?',
      '실험 절차를 검토해주세요',
      '필요한 재료를 더 추천해주세요',
    ],
    4: [
      '이 데이터를 어떻게 해석해야 하나요?',
      '결과를 그래프로 만들려면 어떻게 해야 하나요?',
      '가설과 결과가 다른 이유는 무엇일까요?',
      '결론을 더 명확하게 써주세요',
    ],
    5: [
      '발표를 더 흥미롭게 만들려면?',
      '발표 순서를 검토해주세요',
      '청중의 관심을 끌 방법은?',
      '발표 시 주의할 점은 무엇인가요?',
    ],
    6: [
      '이번 탐구에서 배운 점은 무엇인가요?',
      '다음 탐구 주제를 추천해주세요',
      '탐구 과정에서 개선할 점은?',
      '과학적 사고력이 어떻게 늘었나요?',
    ],
  };

  // 메시지 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 컴포넌트 마운트 시 입력창 포커스
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      await onSendMessage(message, stepData);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 엔터키로 전송
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 추천 질문 클릭
  const handleQuestionClick = (question: string) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  // 메시지 복사
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      // 복사 완료 표시 (간단한 토스트 메시지)
    });
  };

  // 시간 포맷팅
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='bg-white rounded-xl shadow-lg border border-gray-100 h-full flex flex-col'>
      {/* 헤더 */}
      <div className='p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
              <Bot className='w-6 h-6 text-white' />
            </div>
            <div>
              <h3 className='font-bold text-gray-900'>AI 도우미</h3>
              <p className='text-sm text-gray-600'>
                {currentStep}단계 탐구를 도와드릴게요!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-white'
          >
            <X className='w-5 h-5' />
          </button>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4 max-h-96'>
        {messages.length === 0 ? (
          <div className='text-center py-8'>
            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Sparkles className='w-8 h-8 text-blue-500' />
            </div>
            <h4 className='font-medium text-gray-900 mb-2'>
              안녕하세요! AI 도우미예요 👋
            </h4>
            <p className='text-sm text-gray-600 mb-4'>
              {currentStep}단계 탐구에 대해 궁금한 것이 있으면 언제든
              물어보세요!
            </p>

            {/* 추천 질문들 */}
            <div className='space-y-2'>
              <p className='text-xs text-gray-500'>💡 추천 질문:</p>
              <div className='space-y-1'>
                {stepQuestions[currentStep as keyof typeof stepQuestions]
                  ?.slice(0, 2)
                  .map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuestionClick(question)}
                      className='block w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors'
                    >
                      {question}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] ${
                  message.type === 'user' ? 'order-2' : 'order-1'
                }`}
              >
                <div
                  className={`flex items-start space-x-2 ${
                    message.type === 'user'
                      ? 'flex-row-reverse space-x-reverse'
                      : ''
                  }`}
                >
                  {/* 아바타 */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user'
                        ? 'bg-blue-500'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}
                  >
                    {message.type === 'user' ? (
                      <User className='w-4 h-4 text-white' />
                    ) : (
                      <Bot className='w-4 h-4 text-white' />
                    )}
                  </div>

                  {/* 메시지 버블 */}
                  <div
                    className={`relative px-4 py-2 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className='text-sm whitespace-pre-wrap leading-relaxed'>
                      {message.content}
                    </p>

                    {/* 메시지 액션 */}
                    {message.type === 'ai' && (
                      <div className='flex items-center justify-between mt-2 pt-2 border-t border-gray-200'>
                        <span className='text-xs text-gray-500'>
                          {formatTime(message.timestamp)}
                        </span>
                        <div className='flex items-center space-x-1'>
                          <button
                            onClick={() => handleCopyMessage(message.content)}
                            className='p-1 text-gray-400 hover:text-gray-600 transition-colors'
                            title='복사'
                          >
                            <Copy className='w-3 h-3' />
                          </button>
                          <button
                            className='p-1 text-gray-400 hover:text-green-600 transition-colors'
                            title='도움됨'
                          >
                            <ThumbsUp className='w-3 h-3' />
                          </button>
                          <button
                            className='p-1 text-gray-400 hover:text-red-600 transition-colors'
                            title='도움 안됨'
                          >
                            <ThumbsDown className='w-3 h-3' />
                          </button>
                        </div>
                      </div>
                    )}

                    {message.type === 'user' && (
                      <div className='flex justify-end mt-1'>
                        <span className='text-xs text-blue-200'>
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className='flex justify-start'>
            <div className='max-w-[80%]'>
              <div className='flex items-start space-x-2'>
                <div className='w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center'>
                  <Bot className='w-4 h-4 text-white' />
                </div>
                <div className='bg-gray-100 px-4 py-2 rounded-2xl'>
                  <div className='flex space-x-1'>
                    <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                    <div
                      className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 추천 질문 영역 */}
      {messages.length > 0 && (
        <div className='px-4 py-2 border-t border-gray-100'>
          <div className='flex flex-wrap gap-2'>
            {stepQuestions[currentStep as keyof typeof stepQuestions]
              ?.slice(0, 2)
              .map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(question)}
                  className='px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors flex items-center space-x-1'
                >
                  <HelpCircle className='w-3 h-3' />
                  <span>{question}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div className='p-4 border-t border-gray-200'>
        <div className='flex items-end space-x-2'>
          <div className='flex-1'>
            <input
              ref={inputRef}
              type='text'
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='궁금한 것을 물어보세요...'
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none'
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className='p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <Send className='w-5 h-5' />
          </button>
        </div>

        <div className='flex items-center justify-between mt-2 text-xs text-gray-500'>
          <span>Enter로 전송, Shift+Enter로 줄바꿈</span>
          <div className='flex items-center space-x-2'>
            <MessageCircle className='w-3 h-3' />
            <span>{messages.length}개 메시지</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
