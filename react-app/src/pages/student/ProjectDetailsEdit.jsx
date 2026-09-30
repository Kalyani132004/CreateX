import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { projectService } from '../../services/projectService';

export default function ProjectDetailsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    domain: '',
    course: '',
    batch: '',
    technologies: [],
  });

  const [technologyInput, setTechnologyInput] = useState('');

  // ==========================================
  // LOAD EXISTING PROJECT DATA
  // ==========================================
  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);

        // GET /projects/:id/
        const res = await projectService.detail(id);

        const project = res.data;

        // Automatically fill form with previous data
        setForm({
          title: project.title || '',
          description: project.description || '',
          domain: project.domain || '',
          course: project.course || '',
          batch: project.batch || '',
          technologies: project.technologies || [],
        });
      } catch (err) {
        console.error(err);

        toast(err.response?.data?.detail || 'Could not load project.', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [id, toast]);

  // ==========================================
  // INPUT CHANGE
  // ==========================================
  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // ==========================================
  // ADD TECHNOLOGY
  // ==========================================
  function addTechnology() {
    const technology = technologyInput.trim();

    if (!technology) return;

    if (form.technologies.includes(technology)) {
      setTechnologyInput('');
      return;
    }

    setForm((prev) => ({
      ...prev,
      technologies: [...prev.technologies, technology],
    }));

    setTechnologyInput('');
  }

  // ==========================================
  // REMOVE TECHNOLOGY
  // ==========================================
  function removeTechnology(technology) {
    setForm((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((item) => item !== technology),
    }));
  }

  // ==========================================
  // UPDATE PROJECT
  // ==========================================
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('domain', form.domain);
      formData.append('course', form.course);
      formData.append('batch', form.batch);

      // IMPORTANT: JSONField
      formData.append('technologies', JSON.stringify(form.technologies));

      await projectService.update(id, formData);

      toast('Project updated successfully.', 'success');
      navigate('/student/projects/:id');
    } catch (err) {
      console.error(err);

      toast(err.response?.data?.detail || 'Could not update project.', 'error');
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" />

        <p className="cx-small mt-3">Loading project...</p>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================
  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h1 className="cx-h1 mb-1">Edit Project</h1>

        <p className="cx-body mb-0">Update your project information.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="cx-card p-4">
          {/* TITLE */}
          <div className="mb-3">
            <label className="form-label">Project Title</label>

            <input
              type="text"
              name="title"
              className="form-control"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div className="mb-3">
            <label className="form-label">Description</label>

            <textarea
              name="description"
              rows="5"
              className="form-control"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* DOMAIN */}
          <div className="mb-3">
            <label className="form-label">Domain</label>

            <select
              name="domain"
              className="form-select"
              value={form.domain}
              onChange={handleChange}
              required
            >
              <option value="">Select Domain</option>

              <option value="Web Development">Web Development</option>

              <option value="Mobile Application">Mobile Application</option>

              <option value="Data Science">Data Science</option>

              <option value="AI / ML">AI / ML</option>

              <option value="Cyber Security">Cyber Security</option>

              <option value="IoT">IoT</option>

              <option value="Cloud Computing">Cloud Computing</option>

              <option value="Software Development">Software Development</option>
            </select>
          </div>

          {/* COURSE */}
          <div className="mb-3">
            <label className="form-label">Course</label>

            <select
              name="course"
              className="form-select"
              value={form.course}
              onChange={handleChange}
              required
            >
              <option value="">Select Course</option>

              <option value="MCA">MCA</option>
              <option value="BCA">BCA</option>
              <option value="BE">BE</option>
              <option value="BTECH">BTECH</option>
            </select>
          </div>

          {/* BATCH */}
          <div className="mb-3">
            <label className="form-label">Batch</label>

            <input
              type="text"
              name="batch"
              className="form-control"
              value={form.batch}
              onChange={handleChange}
              placeholder="2023-2026"
            />
          </div>

          {/* TECHNOLOGIES */}
          <div className="mb-3">
            <label className="form-label">Technologies</label>

            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                value={technologyInput}
                onChange={(e) => setTechnologyInput(e.target.value)}
                placeholder="e.g. Django"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTechnology();
                  }
                }}
              />

              <button
                type="button"
                className="cx-btn cx-btn-outline"
                onClick={addTechnology}
              >
                Add
              </button>
            </div>

            {/* Existing + New Technologies */}
            <div className="d-flex flex-wrap gap-2 mt-3">
              {form.technologies.map((technology) => (
                <span
                  key={technology}
                  className="badge bg-secondary d-flex align-items-center gap-2"
                >
                  {technology}

                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    style={{ fontSize: '8px' }}
                    onClick={() => removeTechnology(technology)}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* BUTTONS */}
          <div className="d-flex gap-2 mt-4">
            <button
              type="button"
              className="cx-btn cx-btn-outline"
              onClick={() => navigate('/student/projects')}
              disabled={saving}
            >
              Cancel
            </button>

            <button type="submit" className="cx-btn cx-btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Updating...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-1" />
                  Update Project
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
