import api from './api';

export const innovationService = {
  // Runs similarity/originality analysis against the project corpus
  analyze: (ideaText) => api.post('/innovation/analyze/', { idea: ideaText }),

  // Returns nearest-neighbor projects with similarity percentages
  similarProjects: (ideaText) =>
    api.post('/innovation/similar-projects/', { idea: ideaText }),

  // Returns suggestion list + tech stack recommendation
  suggestions: (ideaText, currentStack) =>
    api.post('/innovation/suggestions/', { idea: ideaText, stack: currentStack }),
};
