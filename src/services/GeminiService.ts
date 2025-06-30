import { GoogleGenAI } from '@google/genai';

// AI 응답 타입 정의
export interface AIResponse {
  content: string;
  success: boolean;
  error?: string;
}

export interface TopicRecommendation {
  title: string;
  description: string;
  difficulty: string;
  materials: string[];
  safetyNote: string;
}

export interface FeedbackRequest {
  step: number;
  content: string;
  studentLevel: string;
}

export interface ExperimentPlan {
  title: string;
  hypothesis: string;
  materials: string[];
  procedure: string[];
  variables: {
    independent: string;
    dependent: string;
    controlled: string[];
  };
  safety: string[];
}

// 주제 관련 과학 개념 응답 타입
export interface ConceptResponse extends AIResponse {
  concepts: string[];
}

export class GeminiAIService {
  private client: GoogleGenAI;
  private model: string = 'gemini-2.5-flash';

  constructor() {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API 키가 설정되지 않았습니다.');
    }
    this.client = new GoogleGenAI({
      apiKey: apiKey,
    });
  }

  /**
   * 학생의 관심사를 바탕으로 과학 탐구 주제를 추천
   */
  async recommendTopics(
    interests: string[],
    grade: string = '초등학교'
  ): Promise<TopicRecommendation[]> {
    try {
      const prompt = `
당신은 과학 교육 전문가입니다. ${grade} 학생을 위한 과학 탐구 주제를 추천해주세요.

학생의 관심사: ${interests.join(', ')}

다음 조건을 만족하는 3개의 탐구 주제를 JSON 배열 형태로 추천해주세요:
1. 초등학생 수준에 적합
2. 안전하게 실행 가능
3. 일상에서 구할 수 있는 재료 사용
4. 과학적 방법을 적용할 수 있음

응답 형식:
[
  {
    "title": "탐구 주제명",
    "description": "주제에 대한 간단한 설명 (2-3문장)",
    "difficulty": "쉬움/보통/어려움",
    "materials": ["필요한 재료1", "재료2", "재료3"],
    "safetyNote": "안전 주의사항"
  }
]
(중요: 응답을 마크다운 코드블록으로 감싸지 말고, 순수한 JSON만 반환하세요.)
`;

      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          // maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });
      const content = response.text ?? '';
      const topics = JSON.parse(content);
      return topics;
    } catch (error) {
      console.error('주제 추천 중 오류:', error);
      return this.getFallbackTopics();
    }
  }

  /**
   * 주제와 관련된 개념을 AI로부터 추천
   */
  async fetchConcepts(params: {
    topic: string;
    studentLevel: string;
  }): Promise<ConceptResponse> {
    try {
      const { topic, studentLevel } = params;
      const prompt = `
당신은 과학 교육 전문가입니다. ${studentLevel} 학생이 "${topic}" 주제를 이해할 수 있도록 관련된 과학 개념 5개를 제시해주세요.

[응답 형식]
1. 개념1
2. 개념2
3. 개념3
4. 개념4
5. 개념5

개념 5가지는 제시하지만, 그 외 안내 멘트나 메타 지시사항 등 다른 텍스트는 절대 포함하지 마세요.
`;
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          // maxOutputTokens: 300,
          temperature: 0.6,
        },
      });
      const text = response.text ?? '';
      const parsed = text.split(',').map((item) => item.trim());
      if (parsed && Array.isArray(parsed)) {
        return { content: text, concepts: parsed, success: true };
      }
      throw new Error('형식 오류');
    } catch (error) {
      console.error('개념 추천 중 오류:', error);
      const fallback = this.getFallbackConcepts(params.topic);
      return {
        content: '',
        concepts: fallback,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 탐구 단계별 AI 피드백 제공
   */
  async provideFeedback(request: FeedbackRequest): Promise<AIResponse> {
    try {
      const stepGuides = {
        1: '탐구 주제를 선정할 때는 관찰 가능하고 측정 가능한 현상을 선택하는 것이 중요합니다.',
        2: "좋은 탐구 질문은 '왜', '어떻게', '무엇이' 등으로 시작하며, 실험으로 답할 수 있어야 합니다.",
        3: '실험을 설계할 때는 변인을 명확히 구분하고 통제 조건을 설정해야 합니다.',
        4: '데이터를 분석할 때는 패턴을 찾고, 가설과 비교하여 결론을 도출해야 합니다.',
        5: '발표 자료는 청중이 이해하기 쉽게 구성하고, 핵심 내용을 명확히 전달해야 합니다.',
        6: '성찰 과정에서는 탐구 과정을 돌아보고 개선점을 찾는 것이 중요합니다.',
      };

      const prompt = `
당신은 친근하고 격려적인 과학 교육 AI입니다. 초등학생의 과학 탐구를 도와주세요.

현재 단계: ${request.step}단계
단계 가이드: ${stepGuides[request.step as keyof typeof stepGuides]}
학생 수준: ${request.studentLevel}
학생 응답: "${request.content}"

다음과 같이 피드백을 제공해주세요:
1. 잘한 점 1-2개 (구체적으로 칭찬)
2. 개선할 점 1-2개 (건설적 조언)
3. 다음 단계를 위한 격려 메시지

톤앤매너:
- 친근하고 격려적
- 학생의 노력을 인정
- 구체적이고 실행 가능한 조언
- 과학적 사고 과정 강조

대답은 마크다운 형식 말고 일반 텍스트로 해주세요.
마지막에 전체 내용을 3문장 이내로 요약해주세요.
`;

      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          // maxOutputTokens: 500,
          temperature: 0.6,
        },
      });

      return {
        content: response.text ?? '',
        success: true,
      };
    } catch (error) {
      console.error('피드백 생성 중 오류:', error);
      return {
        content:
          '죄송합니다. 지금은 피드백을 제공할 수 없습니다. 나중에 다시 시도해주세요.',
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  /**
   * 실험 계획 도움말 생성
   */
  async generateExperimentPlan(
    topic: string,
    question: string
  ): Promise<ExperimentPlan | null> {
    try {
      const prompt = `
초등학생을 위한 안전한 실험 계획을 작성해주세요.

탐구 주제: ${topic}
탐구 질문: ${question}

[응답형식]
1. 실험제목: {해당 실험의 제목}
2. 가설: {만약 ~라면, ~할 것이다}
3. 재료: 재료1, 재료2, 재료3
4. 단계:  단계1, 단계2, 단계3, ...
5. 변인: 
  독립변인: {해당 실험의 독립변인}
  종속변인: {해당 실험의 종속변인}
  통제변인: 통제변인1, 통제변인2, ...
},
안전수칙: 안전수칙1, 안전수칙2, ...

[조건]
- 초등학생이 안전하게 수행 가능
- 일상적인 재료 사용
- 명확한 변인 구분
- 구체적인 실험 절차
- 답변은 마크다운이 아닌 일반 텍스트
`;

      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          // maxOutputTokens: 800,
          temperature: 0.5,
        },
      });
      const content = response.text ?? '';
      return JSON.parse(content);
    } catch (error) {
      console.error('실험 계획 생성 중 오류:', error);
      return null;
    }
  }

  /**
   * 발표 대본 생성 도움
   */
  async generatePresentationScript(
    projectData: Record<string, unknown>
  ): Promise<AIResponse> {
    try {
      const prompt = `
다음 탐구 프로젝트를 바탕으로 5분 발표용 대본을 작성해주세요.

프로젝트 데이터: ${JSON.stringify(projectData, null, 2)}

발표 구성:
1. 인사 및 주제 소개 (30초)
2. 탐구 질문과 가설 (1분)
3. 실험 방법 설명 (1분 30초)
4. 결과 발표 (1분 30초)
5. 결론 및 느낀점 (1분)

요구사항:
- 초등학생 수준의 언어 사용
- 자연스러운 말투
- 청중과의 소통 고려
- 핵심 내용 강조
- 답변은 마크다운이 아닌 일반 텍스트
`;

      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          // maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      return {
        content: response.text ?? '',
        success: true,
      };
    } catch (error) {
      console.error('발표 대본 생성 중 오류:', error);
      return {
        content: '발표 대본 생성 중 오류가 발생했습니다.',
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  /**
   * HTML 프레젠테이션 생성 도움
   */
  async generateHtmlPresentation(
    projectData: Record<string, unknown>
  ): Promise<AIResponse> {
    try {
      const { step1, step2, step3, step4, step5, projectTitle } =
        projectData as {
          step1: Record<string, unknown>;
          step2: Record<string, unknown>;
          step3: Record<string, unknown>;
          step4: Record<string, unknown>;
          step5: Record<string, unknown>;
          projectTitle: string;
        };

      const prompt = `
당신은 초등학생을 위한 과학 발표 자료를 HTML 형식으로 생성하는 전문가입니다.
다음 탐구 프로젝트 데이터를 바탕으로 매력적이고 이해하기 쉬운 HTML 프레젠테이션을 만들어주세요.

**프로젝트 제목:** ${projectTitle}

**1단계: 탐구 주제 찾기**
관심사: ${JSON.stringify(step1.interests || [])}
선택된 주제: ${step1.selectedTopic || ''}
주제 선정 이유: ${step1.topicReason || ''}

**2단계: 탐구 질문과 가설**
관찰 내용: ${JSON.stringify(step2.observations || [])}
탐구 질문: ${step2.researchQuestion || ''}
가설: ${step2.hypothesis || ''}

**3단계: 실험 계획하기**
재료: ${JSON.stringify(step3.materials || [])}
절차: ${JSON.stringify(step3.procedure || [])}
변인: ${JSON.stringify(step3.variables || {})}
안전 수칙: ${JSON.stringify(step3.safetyPrecautions || [])}

**4단계: 결과 정리 및 결론**
실험 결과: ${JSON.stringify(step4.experimentResults || [])}
데이터 분석: ${step4.dataAnalysis || ''}
결론: ${step4.conclusion || ''}

**5단계: 탐구 발표 준비 (대본)**
발표 대본: ${step5.presentationScript || ''}

**요구사항:**
1.  **HTML 형식:** 전체 응답은 완전한 HTML 문서여야 합니다. (<html>, <head>, <body> 태그 포함)
2.  **간단한 스타일:** font-size, font-weight 정도만 사용하고, 다른 꾸밈(색상, 배경, 레이아웃 등)은 최소화해주세요. Tailwind CSS는 사용하지 마세요.
3.  **슬라이드 구성:** 각 탐구 단계(1단계~5단계)를 별도의 슬라이드처럼 구성해주세요. 각 슬라이드는 명확한 제목과 내용을 포함해야 합니다.
4.  **간결하고 명확한 내용:** 각 슬라이드의 내용은 간결하게 핵심만 전달하고, 어려운 과학 용어는 쉽게 풀어 설명해주세요.
5.  **이미지/차트:** 데이터가 있다면 가상의 이미지나 차트(placeholder)를 포함하여 시각적 요소를 강조할 수 있습니다. (실제 데이터 렌더링은 불가능하므로, "여기에 차트가 들어갈 예정입니다"와 같은 텍스트로 대체)
6.  **단일 HTML 파일:** 모든 CSS는 '<style>' 태그 내에 포함하고, JavaScript는 '<script>' 태그 내에 포함하여 단일 HTML 파일로 완성해주세요.

(중요: 응답을 마크다운 코드블록으로 감싸지 말고, 순수한 HTML 코드만 반환하세요.)
`;

      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          // maxOutputTokens: 4000, // HTML 생성을 위해 토큰 제한 늘림
          temperature: 0.8,
        },
      });

      return {
        content: response.text ?? '',
        success: true,
      };
    } catch (error) {
      console.error('HTML 프레젠테이션 생성 중 오류:', error);
      return {
        content: 'HTML 프레젠테이션 생성 중 오류가 발생했습니다.',
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  /**
   * 질문 개선 도움말
   */
  async improveQuestion(originalQuestion: string): Promise<AIResponse> {
    try {
      const prompt = `
다음 탐구 질문을 과학적 방법에 더 적합하도록 개선해주세요.

원래 질문: "${originalQuestion}"

개선 기준:
1. 실험으로 답할 수 있는 질문
2. 측정 가능한 변인 포함
3. 명확하고 구체적인 표현
4. 초등학생 수준에 적합

(출력 형식:마크다운이 아닌 일반 텍스트로 해주세요.)
개선된 질문과 함께 왜 더 좋은지 설명해주세요.
마지막에 전체 내용을 3문장 이내로 요약해주세요.
`;

      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          // maxOutputTokens: 400,
          temperature: 0.6,
        },
      });

      return {
        content: response.text ?? '',
        success: true,
      };
    } catch (error) {
      console.error('질문 개선 중 오류:', error);
      return {
        content: '질문 개선 중 오류가 발생했습니다.',
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  /**
   * 데이터 분석 도움말
   */
  async analyzeData(data: unknown[], dataType: string): Promise<AIResponse> {
    try {
      const prompt = `
다음 실험 데이터를 분석하고 결론을 도출하는데 도움을 주세요.

데이터 타입: ${dataType}
실험 데이터: ${JSON.stringify(data, null, 2)}

분석 요청:
1. 데이터에서 발견되는 패턴이나 경향
2. 가능한 결론
3. 추가로 고려해야 할 점
4. 데이터의 신뢰성에 대한 평가

답변은 마크다운이 아닌 일반 텍스트로 해주세요.
초등학생이 이해할 수 있는 수준으로 설명해주세요.
마지막에 전체 내용을 3문장 이내로 요약해주세요.
`;

      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          // maxOutputTokens: 600,
          temperature: 0.5,
        },
      });

      return {
        content: response.text ?? '',
        success: true,
      };
    } catch (error) {
      console.error('데이터 분석 중 오류:', error);
      return {
        content: '데이터 분석 중 오류가 발생했습니다.',
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  /**
   * 주제 관련 개념 폴백 매핑
   */
  private getFallbackConcepts(topic: string): string[] {
    const conceptsMap: Record<string, string[]> = {
      물: ['증발', '응결', '상태변화', '분자운동', '온도'],
      식물: ['광합성', '증산작용', '발아', '생장', '호흡'],
      자석: ['자기장', '극성', '자성체', '전자기력', '인력과 척력'],
      소리: ['진동', '파동', '주파수', '진폭', '매질'],
      빛: ['반사', '굴절', '분산', '흡수', '전자기파'],
      온도: ['열전도', '대류', '복사', '열팽창', '분자운동'],
      산성: ['pH', '이온', '중화반응', '지시약', '산과 염기'],
      용해: ['용매', '용질', '용액', '농도', '포화도'],
    };
    const related: string[] = [];
    Object.keys(conceptsMap).forEach((key) => {
      if (topic.toLowerCase().includes(key)) {
        related.push(...conceptsMap[key]);
      }
    });
    return Array.from(new Set(related));
  }

  /**
   * API 오류 시 기본 주제 제공
   */
  private getFallbackTopics(): TopicRecommendation[] {
    return [
      {
        title: '식물의 성장과 빛의 관계',
        description:
          '서로 다른 조건의 빛에서 식물이 어떻게 자라는지 관찰해보세요. 식물의 광합성과 성장의 관계를 이해할 수 있습니다.',
        difficulty: '쉬움',
        materials: ['콩나물', '화분', '색깔 있는 셀로판지', '자'],
        safetyNote: '식물을 다룰 때 손을 깨끗이 씻고, 도구 사용 시 주의하세요.',
      },
      {
        title: '산성과 염기성 물질 찾기',
        description:
          '집에서 쉽게 구할 수 있는 재료로 천연 지시약을 만들어 다양한 물질의 성질을 알아보세요.',
        difficulty: '보통',
        materials: ['적양배추', '레몬', '베이킹소다', '투명 컵'],
        safetyNote: '식용 재료만 사용하고, 실험 후에는 손을 깨끗이 씻으세요.',
      },
      {
        title: '소리의 전달과 진동',
        description:
          '다양한 재료를 통해 소리가 어떻게 전달되는지 실험하고, 소리와 진동의 관계를 탐구해보세요.',
        difficulty: '쉬움',
        materials: ['실', '종이컵', '고무밴드', '나무막대'],
        safetyNote:
          '큰 소리로 인한 청력 손상을 주의하고, 도구 사용 시 안전에 유의하세요.',
      },
    ];
  }
}

// 싱글톤 인스턴스 생성
export const geminiAI = new GeminiAIService();
