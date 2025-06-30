import React from 'react';
import { BookOpen, Loader2 } from 'lucide-react';

const LoadingView: React.FC = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center'>
      <div className='text-center'>
        <div className='flex items-center justify-center mb-8'>
          <div className='relative'>
            <div className='w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center'>
              <BookOpen className='w-10 h-10 text-white' />
            </div>
            <div className='absolute -top-2 -right-2'>
              <Loader2 className='w-8 h-8 text-blue-500 animate-spin' />
            </div>
          </div>
        </div>

        <h2 className='text-2xl font-bold text-gray-800 mb-4'>
          과학 탐구 여행을 준비하고 있어요
        </h2>

        <p className='text-gray-600 mb-8'>잠시만 기다려주세요...</p>

        <div className='flex items-center justify-center space-x-2'>
          <div className='w-3 h-3 bg-blue-500 rounded-full animate-bounce'></div>
          <div
            className='w-3 h-3 bg-purple-500 rounded-full animate-bounce'
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div
            className='w-3 h-3 bg-blue-500 rounded-full animate-bounce'
            style={{ animationDelay: '0.2s' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingView;
