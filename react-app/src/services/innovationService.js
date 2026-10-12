    
import api from './api';

// DRF may return a plain array or a paginated { results: [...] } object.
const toArray = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

const asText = (value) => (typeof value === 'string' ? value : '');

const asNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const asTechList = (value) =>
  Array.isArray(value)
    ? value.filter(Boolean).map(String)
    : typeof value === 'string'
      ? value
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

export const innovationService = {
  /**
   * One /projects/ read + one ML call. Returns everything the Innovation
   * Assistant screen needs, so callers should not call this twice.
   */
  analyze: async (ideaText, currentStack = [], domain = 'Software Development') => {
    const idea = asText(ideaText).trim();
    if (!idea) throw new Error('Please describe your idea first.');

    const stack = asTechList(currentStack);

    // 1. Existing projects (null-safe: the ML schema expects strings)
    const { data: projectsData } = await api.get('/projects/');

    const existingProjects = toArray(projectsData)
      .filter((project) => project?.id != null)
      .map((project) => ({
        id: project.id,
        title: asText(project.title),
        description: asText(project.description),
        domain: asText(project.domain),
        technologies: asTechList(project.technologies),
      }));

    // 2. Analyze. The title is left empty on purpose: a fixed placeholder
    //    title would be matched against every existing project's text.
    const { data: ml } = await api.post('/ml/analyze', {
      title: '',
      description: idea,
      domain,
      technologies: stack,
      existing_projects: existingProjects,
    });

    // 3. Map the response
    const similarProjects = (ml.similar_projects || []).map((project) => ({
      name: project.title,
      pct: asNumber(project.similarity_score),
    }));

    const suggestions = (ml.suggestions || []).map((s) => ({
      title: s.title || '',
      text: s.description || s.text || s.suggestion || '',
      icon: s.icon || 'bi-lightbulb',
    }));

    const tech = ml.technology_recommendation;

    return {
      data: {
        similarity: asNumber(ml.similarity),
        originality: asNumber(ml.originality),
        innovation: asNumber(ml.innovation),
        gap: asNumber(ml.innovation_gap),

        similarProjects,
        suggestions,
        innovationIdeas: ml.innovation_ideas || [],

        techRecommendation: {
          current: stack,
          recommended: tech?.recommended || [],
          rationale:
            tech?.rationale ||
            'These technologies are recommended based on the project domain and innovation analysis.',
        },
      },
    };
  },
};
