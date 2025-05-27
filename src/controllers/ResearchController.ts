import { ResearchModel } from '../models/ResearchModel';
import {
  ResearchProject,
  ResearchStep,
  ExperimentData,
  ChartData,
  RECOMMENDED_TOPICS,
} from '../models/research-types';
import toast from 'react-hot-toast';

export class ResearchController {
  private researchModel: ResearchModel;

  constructor() {
    this.researchModel = new ResearchModel();
  }

  async initializeProject(
    noteId: string,
    title?: string,
    studentName?: string
  ): Promise<ResearchProject> {
    try {
      // 기존 프로젝트 확인
      let project = await this.researchModel.getProjectByNoteId(noteId);

      if (!project) {
        // 새 프로젝트 생성
        project = await this.researchModel.createProject(
          noteId,
          title,
          studentName
        );
        toast.success('새로운 탐구 프로젝트가 시작되었습니다!');
      }

      return project;
    } catch (error) {
      console.error('Error initializing project:', error);
      toast.error('프로젝트 초기화에 실패했습니다.');
      throw error;
    }
  }

  async saveStepData(
    projectId: string,
    stepNumber: number,
    content: Record<string, any>,
    completed: boolean = false
  ): Promise<ResearchStep> {
    try {
      const step = await this.researchModel.upsertStep(
        projectId,
        stepNumber,
        content,
        completed
      );

      // 현재 단계 업데이트
      await this.researchModel.updateProject(projectId, {
        current_step: Math.max(stepNumber, 1),
        updated_at: new Date().toISOString(),
      });

      toast.success('단계 데이터가 저장되었습니다.');
      return step;
    } catch (error) {
      console.error('Error saving step data:', error);
      toast.error('데이터 저장에 실패했습니다.');
      throw error;
    }
  }

  async generateAIFeedback(question: string, context: any): Promise<string> {
    // AI 피드백 생성 (실제로는 OpenAI API나 다른 AI 서비스 연동)
    try {
      // 임시 피드백 생성 로직
      return this.generateMockAIFeedback(question, context);
    } catch (error) {
      console.error('Error generating AI feedback:', error);
      return '피드백 생성 중 오류가 발생했습니다. 나중에 다시 시도해주세요.';
    }
  }

  async createChart(data: ChartData): Promise<ExperimentData> {
    try {
      // 차트 데이터 검증
      if (!data.data || data.data.length === 0) {
        throw new Error('차트 데이터가 없습니다.');
      }

      const experimentData = await this.researchModel.createExperimentData(
        data.projectId as string,
        'chart',
        data.title,
        {
          type: data.type,
          xAxis: data.xAxis,
          yAxis: data.yAxis,
          data: data.data,
        }
      );

      toast.success('차트가 생성되었습니다.');
      return experimentData;
    } catch (error) {
      console.error('Error creating chart:', error);
      toast.error('차트 생성에 실패했습니다.');
      throw error;
    }
  }

  getRecommendedTopics(category?: string): any[] {
    if (category) {
      const categoryData = RECOMMENDED_TOPICS.find(
        (t) => t.category === category
      );
      return categoryData ? categoryData.topics : [];
    }
    return RECOMMENDED_TOPICS;
  }

  generatePresentationOutline(projectData: any): any[] {
    // 탐구 데이터를 바탕으로 발표 개요 생성
    const outline = [
      {
        order: 1,
        type: 'title',
        title: '제목 슬라이드',
        content: {
          title: projectData.title || '나의 탐구 프로젝트',
          subtitle: '과학적 탐구를 통한 문제 해결',
          author: projectData.student_name || '탐구자',
        },
      },
      {
        order: 2,
        type: 'content',
        title: '탐구 동기 및 질문',
        content: {
          motivation: '왜 이 주제를 선택했는지 설명',
          question: '탐구하고자 하는 질문',
        },
      },
      {
        order: 3,
        type: 'content',
        title: '가설',
        content: {
          hypothesis: '예상되는 결과와 그 이유',
        },
      },
      {
        order: 4,
        type: 'content',
        title: '실험 방법',
        content: {
          materials: '실험 재료 및 도구',
          procedure: '실험 절차',
          variables: '변인 설정',
        },
      },
      {
        order: 5,
        type: 'chart',
        title: '실험 결과',
        content: {
          description: '실험 결과를 그래프와 표로 제시',
          charts: '생성된 차트들',
        },
      },
      {
        order: 6,
        type: 'conclusion',
        title: '결론 및 소감',
        content: {
          conclusion: '실험을 통해 얻은 결론',
          reflection: '탐구 과정에서 배운 점',
          future: '후속 연구 계획',
        },
      },
    ];

    return outline;
  }

  exportChartData(chartData: ExperimentData): void {
    try {
      const data = chartData.data;
      const csvContent = this.convertToCSV(data);

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${chartData.title}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast.success('데이터가 다운로드되었습니다.');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('데이터 내보내기에 실패했습니다.');
    }
  }

  private convertToCSV(data: any): string {
    if (!data.data || !Array.isArray(data.data)) {
      return '';
    }

    const headers = Object.keys(data.data[0] || {});
    const csvRows = [
      headers.join(','),
      ...data.data.map((row: any) =>
        headers.map((header) => row[header] || '').join(',')
      ),
    ];

    return csvRows.join('\n');
  }

  private generateMockAIFeedback(question: string, context: any): string {
    // 실제 구현에서는 AI API 연동
    const feedbacks = [
      '좋은 질문입니다! 이를 실험으로 확인해보는 것은 어떨까요?',
      '이 주제는 흥미로운 과학 원리와 관련이 있습니다. 더 자세히 탐구해보세요.',
      '실험을 설계할 때는 변인을 명확히 구분하는 것이 중요합니다.',
      '이 결과에서 어떤 패턴을 발견할 수 있나요? 그래프로 만들어보면 더 명확할 것 같습니다.',
      '훌륭한 관찰입니다! 이것이 일어나는 과학적 이유를 생각해보세요.',
      '다른 조건에서도 같은 결과가 나올까요? 추가 실험을 계획해보세요.',
    ];

    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
  }

  validateExperimentData(data: any[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(data) || data.length === 0) {
      errors.push('데이터가 없습니다.');
      return { isValid: false, errors };
    }

    // 각 데이터 포인트 검증
    data.forEach((item, index) => {
      if (typeof item.label !== 'string' || !item.label.trim()) {
        errors.push(`${index + 1}번째 데이터의 라벨이 없습니다.`);
      }
      if (typeof item.value !== 'number' || isNaN(item.value)) {
        errors.push(`${index + 1}번째 데이터의 값이 올바르지 않습니다.`);
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  getConceptsRelatedToTopic(topic: string): string[] {
    // 주제와 관련된 과학 개념들 반환
    const concepts: Record<string, string[]> = {
      물: ['증발', '응결', '상태변화', '분자운동', '온도'],
      식물: ['광합성', '증산작용', '발아', '생장', '호흡'],
      자석: ['자기장', '극성', '자성체', '전자기력', '인력과 척력'],
      소리: ['진동', '파동', '주파수', '진폭', '매질'],
      빛: ['반사', '굴절', '분산', '흡수', '전자기파'],
      온도: ['열전도', '대류', '복사', '열팽창', '분자운동'],
      산성: ['pH', '이온', '중화반응', '지시약', '산과 염기'],
      용해: ['용매', '용질', '용액', '농도', '포화도'],
    };

    const relatedConcepts: string[] = [];

    Object.keys(concepts).forEach((key) => {
      if (topic.toLowerCase().includes(key)) {
        relatedConcepts.push(...concepts[key]);
      }
    });

    return [...new Set(relatedConcepts)]; // 중복 제거
  }
}
