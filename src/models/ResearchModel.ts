// src/models/ResearchModel.ts
import { supabase } from '../lib/supabase';
import {
  ResearchProject,
  ResearchStep,
  ExperimentData,
  ResearchQA,
  PresentationData,
} from './research-types';

export class ResearchModel {
  async getProjectByNoteId(noteId: string): Promise<ResearchProject | null> {
    const { data, error } = await supabase
      .from('research_projects')
      .select('*')
      .eq('note_id', noteId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Project not found
      }
      throw new Error(`Failed to fetch research project: ${error.message}`);
    }

    return data;
  }

  async createProject(
    noteId: string,
    title?: string,
    studentName?: string
  ): Promise<ResearchProject> {
    const { data, error } = await supabase
      .from('research_projects')
      .insert([
        {
          note_id: noteId,
          title,
          student_name: studentName,
          current_step: 1,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create research project: ${error.message}`);
    }

    return data;
  }

  async updateProject(
    id: string,
    updates: Partial<ResearchProject>
  ): Promise<ResearchProject> {
    const { data, error } = await supabase
      .from('research_projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update research project: ${error.message}`);
    }

    return data;
  }

  async getStepsByProjectId(projectId: string): Promise<ResearchStep[]> {
    const { data, error } = await supabase
      .from('research_steps')
      .select('*')
      .eq('project_id', projectId)
      .order('step_number', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch research steps: ${error.message}`);
    }

    return data || [];
  }

  async upsertStep(
    projectId: string,
    stepNumber: number,
    content: Record<string, any>,
    completed: boolean = false
  ): Promise<ResearchStep> {
    const { data, error } = await supabase
      .from('research_steps')
      .upsert(
        {
          project_id: projectId,
          step_number: stepNumber,
          step_title: this.getStepTitle(stepNumber),
          content,
          completed,
        },
        {
          onConflict: 'project_id,step_number',
        }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save research step: ${error.message}`);
    }

    return data;
  }

  async getExperimentData(projectId: string): Promise<ExperimentData[]> {
    const { data, error } = await supabase
      .from('experiment_data')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch experiment data: ${error.message}`);
    }

    return data || [];
  }

  async createExperimentData(
    projectId: string,
    dataType: string,
    title: string,
    data: any
  ): Promise<ExperimentData> {
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

    if (error) {
      throw new Error(`Failed to create experiment data: ${error.message}`);
    }

    return result;
  }

  async getQAHistory(
    projectId: string,
    stepNumber?: number
  ): Promise<ResearchQA[]> {
    let query = supabase
      .from('research_qa')
      .select('*')
      .eq('project_id', projectId);

    if (stepNumber) {
      query = query.eq('step_number', stepNumber);
    }

    const { data, error } = await query.order('created_at', {
      ascending: true,
    });

    if (error) {
      throw new Error(`Failed to fetch Q&A history: ${error.message}`);
    }

    return data || [];
  }

  async createQA(
    projectId: string,
    stepNumber: number,
    question: string,
    answer?: string,
    aiFeedback?: string
  ): Promise<ResearchQA> {
    const { data, error } = await supabase
      .from('research_qa')
      .insert([
        {
          project_id: projectId,
          step_number: stepNumber,
          question,
          answer,
          ai_feedback: aiFeedback,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create Q&A: ${error.message}`);
    }

    return data;
  }

  async getPresentationData(projectId: string): Promise<PresentationData[]> {
    const { data, error } = await supabase
      .from('presentation_data')
      .select('*')
      .eq('project_id', projectId)
      .order('slide_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch presentation data: ${error.message}`);
    }

    return data || [];
  }

  async savePresentationSlide(
    projectId: string,
    slideOrder: number,
    slideType: string,
    content: any
  ): Promise<PresentationData> {
    const { data, error } = await supabase
      .from('presentation_data')
      .upsert(
        {
          project_id: projectId,
          slide_order: slideOrder,
          slide_type: slideType,
          content,
        },
        {
          onConflict: 'project_id,slide_order',
        }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save presentation slide: ${error.message}`);
    }

    return data;
  }

  private getStepTitle(stepNumber: number): string {
    const titles = [
      '',
      '탐구 주제 찾기',
      '탐구 질문 만들기와 가설 세우기',
      '실험 계획하기',
      '결과 정리 및 결론 도출',
      '탐구 발표 준비하기',
      '성찰하기',
    ];
    return titles[stepNumber] || '';
  }
}
