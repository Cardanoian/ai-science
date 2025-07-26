import { supabase } from '../lib/supabase';
import { geminiAI } from '../services/GeminiService';
import type {
  ResearchProject,
  ResearchStepContent,
  ResearchTopicRecommendation,
  ChartData,
  LegacyChartData,
  ChartSeries,
} from '../models/types';
import type { ExperimentPlan } from '../services/GeminiService';
import toast from 'react-hot-toast';

export class ResearchController {
  // 노트로 프로젝트 조회
  async getProjectByNoteId(noteId: string): Promise<ResearchProject | null> {
    try {
      const { data, error } = await supabase
        .from('research_projects')
        .select('*')
        .eq('note_id', noteId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  }

  // 프로젝트 생성
  async createProject(
    noteId: string,
    title?: string
  ): Promise<ResearchProject> {
    try {
      const { data, error } = await supabase
        .from('research_projects')
        .insert([
          {
            note_id: noteId,
            title: title?.trim() || null,
            current_step: 1,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('새로운 탐구 프로젝트가 시작되었습니다!');
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('프로젝트 생성에 실패했습니다.');
      throw error;
    }
  }

  // 프로젝트 업데이트
  async updateProject(
    projectId: string,
    updates: Partial<ResearchProject>
  ): Promise<ResearchProject> {
    try {
      const timestamp = new Date().toISOString();

      // 먼저 프로젝트를 조회하여 note_id를 확보합니다.
      const { data: projectData, error: fetchError } = await supabase
        .from('research_projects')
        .select('note_id')
        .eq('id', projectId)
        .single();

      if (fetchError) throw fetchError;
      if (!projectData) throw new Error('Project not found');

      const { data, error: updateError } = await supabase
        .from('research_projects')
        .update({
          ...updates,
          updated_at: timestamp,
        })
        .eq('id', projectId)
        .select()
        .single();

      if (updateError) throw updateError;

      // 확보된 note_id를 사용하여 노트를 업데이트합니다.
      await supabase
        .from('notes')
        .update({
          updated_at: timestamp,
        })
        .eq('id', projectData.note_id);

      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('프로젝트 업데이트에 실패했습니다.');
      throw error;
    }
  }

  // 단계 데이터 조회
  async getStepData(
    projectId: string,
    stepNumber: number
  ): Promise<ResearchStepContent | null> {
    try {
      const { data, error } = await supabase
        .from('research_projects')
        .select('all_steps')
        .eq('id', projectId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.all_steps && data.all_steps[stepNumber]) {
        return data.all_steps[stepNumber];
      }

      return null;
    } catch (error) {
      console.error('Error fetching step data:', error);
      return null;
    }
  }

  // 단계 데이터 저장/업데이트
  async saveStepData(
    projectId: string,
    stepNumber: number,
    content: ResearchStepContent
  ): Promise<ResearchStepContent> {
    try {
      // 4단계 차트 데이터 검증 및 정리
      if (stepNumber === 4 && content.chartData) {
        console.log('Saving chart data:', content.chartData);

        // 차트 데이터가 새로운 구조인지 확인
        const chartData = content.chartData as ChartData;
        if (!chartData.series || !Array.isArray(chartData.series)) {
          console.warn('Chart data missing series, attempting migration');
          const migratedData = this.migrateChartData(chartData);
          if (migratedData) {
            content.chartData = migratedData;
          }
        }
      }

      // 현재 프로젝트의 all_steps 데이터 조회
      const { data: project, error: fetchError } = await supabase
        .from('research_projects')
        .select('all_steps')
        .eq('id', projectId)
        .single();

      if (fetchError) throw fetchError;

      // 기존 all_steps 데이터 가져오기 (없으면 빈 객체)
      const currentAllSteps = project?.all_steps || {};

      // 해당 단계 데이터 업데이트
      const updatedAllSteps = {
        ...currentAllSteps,
        [stepNumber]: content,
      };

      const timestamp = new Date().toISOString();

      console.log(`Saving step ${stepNumber} data:`, content);

      // all_steps 필드 업데이트
      const { error: updateProjectError } = await supabase
        .from('research_projects')
        .update({
          all_steps: updatedAllSteps,
          current_step: Math.max(stepNumber, 1),
          updated_at: timestamp,
        })
        .eq('id', projectId);

      if (updateProjectError) {
        console.error('Database update error:', updateProjectError);
        throw updateProjectError;
      }

      // note_id를 조회하여 note를 업데이트합니다.
      const { data: proj } = await supabase
        .from('research_projects')
        .select('note_id')
        .eq('id', projectId)
        .single();

      if (proj?.note_id) {
        const noteUpdates: { updated_at: string; content?: string } = {
          updated_at: timestamp,
        };

        // 1단계 최종 탐구 주제 작성 시 노트 제목도 함께 업데이트
        if (stepNumber === 1 && content.selectedTopic) {
          noteUpdates.content = content.selectedTopic;
        }

        await supabase.from('notes').update(noteUpdates).eq('id', proj.note_id);
      }

      console.log(`Step ${stepNumber} data saved successfully`);
      return content;
    } catch (error) {
      console.error('Error saving step data:', error);
      toast.error('데이터 저장에 실패했습니다.');
      throw error;
    }
  }

  // 전체 단계 데이터 저장/업데이트
  async saveAllStepsData(
    projectId: string,
    allContent: Record<number, ResearchStepContent | null>
  ): Promise<ResearchProject> {
    try {
      const timestamp = new Date().toISOString();
      const { data, error } = await supabase
        .from('research_projects')
        .update({
          all_steps: allContent,
          updated_at: timestamp,
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('notes')
        .update({
          updated_at: timestamp,
        })
        .eq('id', data.note_id);

      // toast.success('전체 단계 데이터가 저장되었습니다.');
      return data;
    } catch (error) {
      console.error('Error saving all steps data:', error);
      toast.error('전체 단계 데이터 저장에 실패했습니다.');
      throw error;
    }
  }

  // AI 피드백 생성 (stepData를 context로 추가)
  async generateAIFeedback(
    question: string,
    stepNumber: number,
    stepData?: ResearchStepContent
  ): Promise<string> {
    try {
      const contextText =
        stepData && Object.keys(stepData).length > 0
          ? `\n\n[학생이 입력한 자료]\n${JSON.stringify(stepData, null, 2)}`
          : '';
      const request = {
        step: stepNumber,
        content: question + contextText,
        studentLevel: '초등학교',
      };

      const response = await geminiAI.provideFeedback(request);

      if (response.success) {
        return response.content;
      } else {
        return '죄송합니다. 지금은 피드백을 제공할 수 없습니다. 나중에 다시 시도해주세요.';
      }
    } catch (error) {
      console.error('Error generating AI feedback:', error);
      return '피드백 생성 중 오류가 발생했습니다. 나중에 다시 시도해주세요.';
    }
  }

  // 주제 추천
  async getTopicRecommendations(
    interests: string[]
  ): Promise<ResearchTopicRecommendation[]> {
    try {
      const topics = await geminiAI.recommendTopics(interests, '초등학교');
      // 각 topic에 concepts 필드가 없으면 빈 배열로 추가
      return topics.map((topic: unknown) => {
        const t = topic as Partial<ResearchTopicRecommendation>;
        return {
          ...t,
          concepts: Array.isArray(t.concepts) ? t.concepts : [],
        } as ResearchTopicRecommendation;
      });
    } catch (error) {
      console.error('Error getting topic recommendations:', error);
      return this.getFallbackTopics();
    }
  }

  // 실험 계획 생성
  async generateExperimentPlan(
    topic: string,
    question: string
  ): Promise<ExperimentPlan | null> {
    try {
      const plan = await geminiAI.generateExperimentPlan(topic, question);
      return plan;
    } catch (error) {
      console.error('Error generating experiment plan:', error);
      return null;
    }
  }

  // 발표 대본 생성
  async generatePresentationScript(
    projectData: Record<string, unknown>
  ): Promise<string> {
    try {
      const response = await geminiAI.generatePresentationScript(projectData);
      return response.success
        ? response.content
        : '발표 대본 생성에 실패했습니다.';
    } catch (error) {
      console.error('Error generating presentation script:', error);
      return '발표 대본 생성 중 오류가 발생했습니다.';
    }
  }

  // HTML 프레젠테이션 생성
  async generateHtmlPresentation(
    projectData: Record<string, unknown>
  ): Promise<string | null> {
    try {
      const response = await geminiAI.generateHtmlPresentation(projectData);
      return response.success ? response.content : null;
    } catch (error) {
      console.error('Error generating HTML presentation:', error);
      return null;
    }
  }

  // 데이터 분석 도움
  async analyzeData(data: unknown[], dataType: string): Promise<string> {
    try {
      const response = await geminiAI.analyzeData(data, dataType);
      return response.success
        ? response.content
        : '데이터 분석에 실패했습니다.';
    } catch (error) {
      console.error('Error analyzing data:', error);
      return '데이터 분석 중 오류가 발생했습니다.';
    }
  }

  // 질문 개선 도움
  async improveQuestion(question: string): Promise<string> {
    try {
      const response = await geminiAI.improveQuestion(question);
      return response.success ? response.content : '질문 개선에 실패했습니다.';
    } catch (error) {
      console.error('Error improving question:', error);
      return '질문 개선 중 오류가 발생했습니다.';
    }
  }
  // 주제와 관련된 과학 개념 반환
  async getConceptsRelatedToTopic(topic: string): Promise<string[]> {
    const { concepts } = await geminiAI.fetchConcepts({
      topic,
      studentLevel: '초등학교',
    });
    return concepts;
  }

  // 차트 데이터 호환성 처리 - 레거시 데이터를 새 구조로 변환
  private migrateChartData(chartData: unknown): ChartData | null {
    if (!chartData || typeof chartData !== 'object') {
      return null;
    }

    const data = chartData as Record<string, unknown>;

    // 이미 새로운 구조인 경우
    if (data.series && Array.isArray(data.series)) {
      return data as unknown as ChartData;
    }

    // 레거시 구조인 경우 변환
    if (data.data && Array.isArray(data.data)) {
      const legacyData = data as unknown as LegacyChartData;

      // 기본 시리즈 생성
      const defaultSeries: ChartSeries = {
        name: '시리즈 1',
        color: '#3b82f6',
      };

      // 레거시 데이터를 새 구조로 변환
      const newData = legacyData.data.map((point) => ({
        name: point.name,
        [defaultSeries.name]: [point.value],
      }));

      return {
        id: legacyData.id,
        type: legacyData.type,
        title: legacyData.title,
        xAxisLabel: legacyData.xAxisLabel,
        yAxisLabel: legacyData.yAxisLabel,
        series: [defaultSeries],
        data: newData,
      };
    }

    return null;
  }

  // 단계 데이터 조회 시 차트 데이터 호환성 처리
  async getStepDataWithMigration(
    projectId: string,
    stepNumber: number
  ): Promise<ResearchStepContent | null> {
    try {
      const stepData = await this.getStepData(projectId, stepNumber);

      if (stepData && stepData.chartData) {
        const migratedChartData = this.migrateChartData(stepData.chartData);
        if (migratedChartData) {
          stepData.chartData = migratedChartData;
        }
      }

      return stepData;
    } catch (error) {
      console.error('Error fetching step data with migration:', error);
      return null;
    }
  }

  // 기본 주제 제공 (AI 실패 시)
  private getFallbackTopics(): ResearchTopicRecommendation[] {
    return [
      {
        title: '식물과 빛의 관계',
        description: '식물이 빛의 양과 색에 따라 어떻게 자라는지 관찰해보세요.',
        difficulty: '쉬움',
        materials: ['콩나물', '화분', '색깔 있는 셀로판지', '자'],
        safetyNote: '식물을 다룰 때 손을 깨끗이 씻고, 도구 사용 시 주의하세요.',
        concepts: ['광합성', '엽록소', '성장'],
      },
      {
        title: '물의 상태 변화',
        description: '온도에 따른 물의 상태 변화를 실험으로 확인해보세요.',
        difficulty: '쉬움',
        materials: ['물', '온도계', '가열 도구', '얼음'],
        safetyNote: '가열 시 화상에 주의하고, 어른과 함께 실험하세요.',
        concepts: ['증발', '응결', '상태변화'],
      },
      {
        title: '산성과 염기성',
        description: '천연 지시약으로 생활 속 물질의 성질을 알아보세요.',
        difficulty: '보통',
        materials: ['적양배추', '레몬', '베이킹소다', '투명 컵'],
        safetyNote: '식용 재료만 사용하고, 실험 후에는 손을 깨끗이 씻으세요.',
        concepts: ['pH', '산과 염기', '중화반응'],
      },
      {
        title: '소리의 진동',
        description: '다양한 재료로 소리의 진동과 전달을 탐구해보세요.',
        difficulty: '보통',
        materials: ['실', '종이컵', '고무밴드', '나무막대'],
        safetyNote:
          '큰 소리로 인한 청력 손상을 주의하고, 도구 사용 시 안전에 유의하세요.',
        concepts: ['진동', '파동', '주파수'],
      },
    ];
  }
}
