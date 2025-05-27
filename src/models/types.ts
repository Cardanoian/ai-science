// src/models/research-types.ts

export interface ResearchProject {
  id: string;
  note_id: string;
  title?: string;
  student_name?: string;
  current_step: number;
  created_at: string;
  updated_at: string;
}

export interface ResearchStep {
  id: string;
  project_id: string;
  step_number: number;
  step_title: string;
  content: Record<string, any>;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExperimentData {
  id: string;
  project_id: string;
  data_type: 'table' | 'chart' | 'observation';
  title: string;
  data: any;
  created_at: string;
}

export interface ResearchQA {
  id: string;
  project_id: string;
  step_number: number;
  question: string;
  answer?: string;
  ai_feedback?: string;
  created_at: string;
}

export interface PresentationData {
  id: string;
  project_id: string;
  slide_order: number;
  slide_type: 'title' | 'content' | 'chart' | 'conclusion';
  content: Record<string, any>;
  created_at: string;
}

// 탐구 단계 정보
export const RESEARCH_STEPS = [
  {
    number: 1,
    title: '탐구 주제 찾기',
    description: '궁금한 것을 찾아 탐구할 주제를 정해보세요',
    explanation: `문제 인식이란?
    
과학자처럼 탐구하기의 첫 번째 단계입니다.
일상생활에서 "왜 그럴까?", "어떻게 될까?" 하는 궁금증을 찾는 것입니다.

예시:
• 왜 물은 100도에서 끓을까?
• 식물은 어떤 조건에서 더 잘 자랄까?
• 어떤 재료로 만든 종이비행기가 더 멀리 날아갈까?

좋은 탐구 주제의 특징:
1. 관찰이나 실험으로 답을 찾을 수 있어야 함
2. 안전하게 실험할 수 있어야 함
3. 나에게 흥미로운 주제여야 함`,
  },
  {
    number: 2,
    title: '탐구 질문 만들기와 가설 세우기',
    description: '탐구 질문을 명확히 하고 예상 답을 세워보세요',
    explanation: `가설 설정이란?

탐구 질문에 대한 나의 예상 답변입니다.
"만약 ~라면, ~일 것이다"의 형태로 작성합니다.

탐구 질문 만들기:
• 구체적이고 명확해야 합니다
• 실험으로 확인할 수 있어야 합니다
• "어떤 조건에서", "얼마나", "어떻게" 등의 표현 사용

가설 세우기:
• 이전 경험이나 지식을 바탕으로 합니다
• 논리적인 근거가 있어야 합니다
• 틀려도 괜찮습니다 (가설은 확인하는 것이 목적)`,
  },
  {
    number: 3,
    title: '실험 계획하기',
    description: '가설을 확인할 실험 방법을 계획해보세요',
    explanation: `실험 계획이란?

가설을 확인하기 위한 구체적인 실험 방법을 설계하는 단계입니다.

실험 계획에 포함할 내용:
1. 실험 재료 및 도구
2. 실험 방법 (단계별 절차)
3. 변인 설정
   - 독립변인: 내가 바꾸는 조건
   - 종속변인: 관찰하고 측정할 결과
   - 통제변인: 같게 유지할 조건
4. 안전 주의사항
5. 측정 방법 및 기록 방법

좋은 실험의 조건:
• 공정한 실험 (한 번에 하나의 조건만 바꿈)
• 반복 실험 (정확성을 위해 여러 번 실행)
• 안전한 실험`,
  },
  {
    number: 4,
    title: '결과 정리 및 결론 도출',
    description: '실험 결과를 정리하고 결론을 내려보세요',
    explanation: `결과 정리 및 결론이란?

실험에서 얻은 자료를 체계적으로 정리하고 분석하여 결론을 도출하는 단계입니다.

결과 정리 방법:
1. 관찰 내용 기록
2. 측정 데이터 정리 (표, 그래프 활용)
3. 사진이나 그림으로 기록
4. 패턴이나 규칙성 찾기

결론 도출:
• 실험 결과가 가설과 일치하는지 확인
• 예상과 다른 결과가 나온 이유 생각해보기
• 실험의 한계점이나 개선점 찾기
• 새로운 궁금증이나 후속 실험 아이디어 제시

객관적이고 정확한 결론을 내리는 것이 중요합니다.`,
  },
  {
    number: 5,
    title: '탐구 발표 준비하기',
    description: '탐구 과정과 결과를 발표할 자료를 만들어보세요',
    explanation: `발표 준비란?

탐구한 내용을 다른 사람들과 공유하기 위해 발표 자료를 만드는 단계입니다.

발표 구성 요소:
1. 제목 슬라이드 (주제, 탐구자 이름)
2. 탐구 동기 및 질문
3. 가설
4. 실험 방법
5. 실험 결과 (그래프, 표, 사진 활용)
6. 결론
7. 소감 및 후속 연구 계획

발표 팁:
• 듣는 사람이 이해하기 쉽게 설명
• 시각 자료(그래프, 사진 등) 적극 활용
• 핵심 내용을 명확하게 전달
• 질문에 대비하여 준비`,
  },
  {
    number: 6,
    title: '성찰하기',
    description: '탐구 과정을 돌아보고 배운 점을 정리해보세요',
    explanation: `성찰하기란?

탐구 과정 전체를 돌아보며 배운 점과 아쉬운 점을 정리하는 단계입니다.

성찰 내용:
1. 탐구 과정에서 배운 점
2. 어려웠던 점과 해결 방법
3. 예상과 다른 결과에 대한 생각
4. 실험 방법의 개선점
5. 새롭게 생긴 궁금증
6. 과학적 사고력의 변화

성찰의 중요성:
• 탐구 능력 향상에 도움
• 과학적 사고력 발달
• 다음 탐구에 대한 동기 부여
• 문제 해결 능력 향상

성찰을 통해 더 나은 탐구자가 될 수 있습니다.`,
  },
];

// 추천 탐구 주제
export const RECOMMENDED_TOPICS = [
  {
    category: '물리',
    topics: [
      '종이비행기의 날개 모양에 따른 비행 거리 비교',
      '경사면의 각도가 구슬의 속도에 미치는 영향',
      '자석의 크기와 철 클립을 끌어당기는 거리의 관계',
      '소리의 전달 속도를 다양한 재료에서 비교하기',
    ],
  },
  {
    category: '화학',
    topics: [
      '베이킹소다와 식초의 반응에서 온도의 영향',
      '물의 온도가 설탕의 용해 속도에 미치는 영향',
      '다양한 과일의 산성도 비교하기',
      '천연 지시약으로 산성과 염기성 구분하기',
    ],
  },
  {
    category: '생물',
    topics: [
      '빛의 방향이 식물의 생장에 미치는 영향',
      '씨앗의 발아에 영향을 주는 환경 조건 찾기',
      '다양한 환경에서 곰팡이의 생장 비교',
      '식물의 잎 모양과 증산 작용의 관계',
    ],
  },
  {
    category: '지구과학',
    topics: [
      '토양의 종류에 따른 물의 흡수율 비교',
      '바람의 세기가 증발 속도에 미치는 영향',
      '날씨 변화와 기압의 관계 관찰하기',
      '다양한 암석의 특성 비교 관찰',
    ],
  },
];

// 차트 데이터 타입
export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'scatter';
  title: string;
  xAxis: string;
  yAxis: string;
  data: Array<{
    label: string;
    value: number;
    [key: string]: any;
  }>;
}
