import {
  BarChart3,
  FlaskConical,
  Heart,
  Lightbulb,
  Presentation,
  Search,
} from 'lucide-react';

const RESEARCH_STEPS = [
  {
    id: 1,
    title: '탐구 주제 찾기',
    description: '관심 있는 현상을 관찰하고 탐구할 주제를 선정합니다.',
    icon: Search,
    color: 'bg-blue-500',
  },
  {
    id: 2,
    title: '탐구 질문과 가설',
    description:
      '관찰한 현상에 대한 질문을 만들고 예상 답안을 가설로 세웁니다.',
    icon: Lightbulb,
    color: 'bg-yellow-500',
  },
  {
    id: 3,
    title: '실험 계획하기',
    description: '가설을 검증하기 위한 실험을 구체적으로 계획합니다.',
    icon: FlaskConical,
    color: 'bg-green-500',
  },
  {
    id: 4,
    title: '결과 정리 및 결론',
    description: '실험 결과를 정리하고 분석하여 결론을 도출합니다.',
    icon: BarChart3,
    color: 'bg-purple-500',
  },
  {
    id: 5,
    title: '탐구 발표 준비',
    description: '탐구 과정과 결과를 다른 사람들에게 발표할 자료를 준비합니다.',
    icon: Presentation,
    color: 'bg-orange-500',
  },
  {
    id: 6,
    title: '성찰하기',
    description: '탐구 과정을 돌아보고 배운 점과 개선점을 정리합니다.',
    icon: Heart,
    color: 'bg-pink-500',
  },
];

export default RESEARCH_STEPS;
