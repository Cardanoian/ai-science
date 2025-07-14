import { supabase } from '../lib/supabase';
import { geminiAI } from '../services/GeminiService';
import type {
  ResearchProject,
  ResearchStep,
  ExperimentData,
  ResearchStepContent,
  ResearchTopicRecommendation,
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
      const { data, error } = await supabase
        .from('research_projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
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
  ): Promise<ResearchStep | null> {
    try {
      const { data, error } = await supabase
        .from('research_steps')
        .select('*')
        .eq('project_id', projectId)
        .eq('step_number', stepNumber)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching step data:', error);
      return null;
    }
  }

  // 단계 데이터 저장/업데이트
  async saveStepData(
    projectId: string,
    stepNumber: number,
    content: ResearchStepContent,
    completed: boolean = false
  ): Promise<ResearchStep> {
    try {
      const stepTitle = this.getStepTitle(stepNumber);

      // 단계 데이터 존재 여부 확인 및 insert/update 분기 처리
      let data: ResearchStep;
      const existingResult = await supabase
        .from('research_steps')
        .select('*')
        .eq('project_id', projectId)
        .eq('step_number', stepNumber)
        .maybeSingle();
      if (existingResult.error) throw existingResult.error;
      if (existingResult.data) {
        // 기존 데이터가 있을 때는 id로 update
        const updateResult = await supabase
          .from('research_steps')
          .update({
            step_title: stepTitle,
            content,
            completed,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingResult.data.id)
          .select()
          .single();
        if (updateResult.error) throw updateResult.error;
        data = updateResult.data;
      } else {
        const insertResult = await supabase
          .from('research_steps')
          .insert([
            {
              project_id: projectId,
              step_number: stepNumber,
              step_title: stepTitle,
              content,
              completed,
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();
        if (insertResult.error) throw insertResult.error;
        data = insertResult.data;
      }

      // 현재 단계 업데이트
      await this.updateProject(projectId, {
        current_step: Math.max(stepNumber, 1),
      });

      // 1단계 최종 탐구 주제 작성 시 노트 제목 업데이트
      if (stepNumber === 1 && content.selectedTopic) {
        try {
          const { data: proj } = await supabase
            .from('research_projects')
            .select('note_id')
            .eq('id', projectId)
            .single();
          const noteId = proj?.note_id;
          if (noteId) {
            await supabase
              .from('notes')
              .update({
                content: content.selectedTopic,
              })
              .eq('id', noteId);
          }
        } catch (err) {
          console.error(
            'Error updating note content with selected topic:',
            err
          );
        }
      }
      return data;
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
      const { data, error } = await supabase
        .from('research_projects')
        .update({
          all_steps: allContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single();
      if (error) throw error;
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

  // 차트 데이터 생성
  async createExperimentData(
    projectId: string,
    dataType: string,
    title: string,
    data: Record<string, unknown>
  ): Promise<ExperimentData> {
    try {
      const { data: result, error } = await supabase
        .from('experiment_data')
        .insert([
          {
            project_id: projectId,
            data_type: dataType,
            title,
            data,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // toast.success('실험 데이터가 저장되었습니다.');
      return result;
    } catch (error) {
      console.error('Error creating experiment data:', error);
      toast.error('데이터 저장에 실패했습니다.');
      throw error;
    }
  }

  // 프로젝트의 실험 데이터 조회
  async getExperimentData(projectId: string): Promise<ExperimentData[]> {
    try {
      const { data, error } = await supabase
        .from('experiment_data')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching experiment data:', error);
      return [];
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

  // 단계 제목 반환
  private getStepTitle(stepNumber: number): string {
    const titles = {
      1: '탐구 주제 찾기',
      2: '탐구 질문과 가설',
      3: '실험 계획하기',
      4: '결과 정리 및 결론',
      5: '탐구 발표 준비',
      6: '성찰하기',
    };
    return titles[stepNumber as keyof typeof titles] || `${stepNumber}단계`;
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

  // 주제와 관련된 과학 개념 반환
  async getConceptsRelatedToTopic(topic: string): Promise<string[]> {
    const { concepts } = await geminiAI.fetchConcepts({
      topic,
      studentLevel: '초등학교',
    });
    return concepts;
  }

  // CSV 데이터 내보내기
  exportDataAsCSV(data: Record<string, unknown>[], filename: string): void {
    try {
      if (!data || data.length === 0) {
        toast.error('내보낼 데이터가 없습니다.');
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header];
              return typeof value === 'string' && value.includes(',')
                ? `"${value}"`
                : value;
            })
            .join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
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
}
