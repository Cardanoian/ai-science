export interface ColorItem {
  name: string;
  value: string;
  preview?: string;
}

export const colorPalette: ColorItem[] = [
  { name: '노란색', value: '#fbbf24' },
  { name: '하늘색', value: '#60a5fa' },
  { name: '연두색', value: '#34d399' },
  { name: '분홍색', value: '#f472b6' },
  { name: '보라색', value: '#a78bfa' },
  { name: '주황색', value: '#fb923c' },
  { name: '민트색', value: '#06d6a0' },
  { name: '코랄색', value: '#ff6b6b' },
];

export const classColorPalette: ColorItem[] = [
  { name: '파란색', value: '#3b82f6', preview: 'bg-blue-500' },
  { name: '보라색', value: '#8b5cf6', preview: 'bg-purple-500' },
  { name: '초록색', value: '#10b981', preview: 'bg-emerald-500' },
  { name: '주황색', value: '#f59e0b', preview: 'bg-amber-500' },
  { name: '분홍색', value: '#ec4899', preview: 'bg-pink-500' },
  { name: '청록색', value: '#06b6d4', preview: 'bg-cyan-500' },
  { name: '인디고', value: '#6366f1', preview: 'bg-indigo-500' },
  { name: '회색', value: '#6b7280', preview: 'bg-gray-500' },
];
