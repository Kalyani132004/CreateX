import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { projectService } from '../../services/projectService';

const DOMAINS = [
  'Web Development',
  'Mobile Application',
  'Data Science',
  'AI / ML',
  'Cyber Security',
  'IoT',
  'Cloud Computing',
  'Software Development',
];
const COURSES = ['MCA', 'BCA', 'BE', 'BTECH'];
const BATCHES = ['2021-2025', '2022-2026', '2023-2025', '2023-2026'];
const TECH_OPTIONS = [
  'React',
  'Django',
  'Node.js',
  'Python',
  'Flutter',
  'TensorFlow',
  'PostgreSQL',
  'MongoDB',
  'AWS',
  'Docker',
  'Firebase',
  'Java',
  'Spring Boot',
  'PHP',
  'Vue.js',
];

const MIN_IMAGES = 2;
const MAX_IMAGE_MB = 10;

export default function AddProject() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [course, setCourse] = useState('');
  const [batch, setBatch] = useState(BATCHES[1]);
  const [techs, setTechs] = useState(new Set());

  const [images, setImages] = useState([]); // [{file, url}]
  const [dragging, setDragging] = useState(false);
  const [docFile, setDocFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const imgInputRef = useRef(null);
  const docInputRef = useRef(null);
  const videoInputRef = useRef(null);

  function toggleTech(t) {
    setTechs((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }

  function addImages(fileList) {
    const files = Array.from(fileList).filter((f) => {
      if (!f.type.startsWith('image/')) return false;
      if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
        toast(`${f.name} is over ${MAX_IMAGE_MB}MB and was skipped.`, 'warn');
        return false;
      }
      return true;
    });
    const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...next]);
  }

  function removeImage(index) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addImages(e.dataTransfer.files);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !domain || !course) {
      toast('Please fill in all required project details.', 'error');
      return;
    }
    if (techs.size === 0) {
      toast('Select at least one technology.', 'error');
      return;
    }
    //number of images count
    if (images.length < MIN_IMAGES) {
      toast(`Please upload at least ${MIN_IMAGES} project images.`, 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('domain', domain);
    formData.append('course', course);
    formData.append('batch', batch);
    formData.append('technologies', JSON.stringify([...techs]));
    images.forEach(({ file }) => formData.append('images', file));
    if (docFile) formData.append('documentation', docFile);
    if (videoFile) formData.append('screen_recording', videoFile);

    setSubmitting(true);
    try {
      await projectService.create(formData);
      toast('Project submitted successfully.');
      navigate(`/student/projects/view/${projectId}`);
    } catch (err) {
      toast(err.message || 'Could not submit your project. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="cx-h1 mb-1">Add New Project</h1>
        <p className="cx-body mb-0">
          Share your work with the CreateX community and get an instant Innovation
          Score.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="cx-card p-4 p-lg-5">
              <h3 className="cx-h3 mb-3">Project Details</h3>

              <div className="cx-field">
                <label htmlFor="title">
                  Project Title <span className="req">*</span>
                </label>
                <input
                  id="title"
                  className="cx-input"
                  required
                  placeholder="e.g. CampusConnect — Peer Mentorship Platform"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="cx-field">
                <label htmlFor="description">
                  Project Description <span className="req">*</span>
                </label>
                <textarea
                  id="description"
                  className="cx-input"
                  rows={4}
                  required
                  placeholder="Describe the problem, your approach, and what makes it stand out..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="cx-hint">
                  Minimum 100 characters recommended for accurate scoring.
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="cx-field mb-0">
                    <label htmlFor="domain">
                      Domain <span className="req">*</span>
                    </label>
                    <select
                      id="domain"
                      className="cx-select"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                    >
                      <option value="">Select domain</option>
                      {DOMAINS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="cx-field mb-0">
                    <label htmlFor="course">
                      Course <span className="req">*</span>
                    </label>
                    <select
                      id="course"
                      className="cx-select"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                    >
                      <option value="">Select course</option>
                      {COURSES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="cx-field mt-3">
                <label>
                  Technologies Used <span className="req">*</span>
                </label>
                <div className="tech-multiselect">
                  {TECH_OPTIONS.map((t) => (
                    <span
                      key={t}
                      className={`cx-chip ${techs.has(t) ? 'active' : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleTech(t)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleTech(t);
                        }
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="cx-hint">
                  Selected: {techs.size} technolog{techs.size === 1 ? 'y' : 'ies'}
                </div>
              </div>

              <div className="cx-field">
                <label htmlFor="batch">
                  Batch <span className="req">*</span>
                </label>
                <select
                  id="batch"
                  className="cx-select"
                  style={{ maxWidth: 220 }}
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                >
                  {BATCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="cx-card p-4 p-lg-5 mt-4">
              <h3 className="cx-h3 mb-1">Project Images</h3>
              <p className="cx-small mb-3">
                Upload a minimum of {MIN_IMAGES} images. Drag & drop or click to browse.
              </p>

              <div
                className={`cx-dropzone ${dragging ? 'drag' : ''}`}
                tabIndex={0}
                role="button"
                aria-label="Upload project images"
                onClick={() => imgInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    imgInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                <i
                  className="bi bi-cloud-arrow-up"
                  style={{ fontSize: '1.8rem', color: 'var(--c-muted)' }}
                ></i>
                <div className="cx-small mt-2 mb-0">
                  Drag images here, or <span className="cx-link">browse files</span>
                </div>
                <div className="cx-caption mt-1">
                  PNG, JPG up to {MAX_IMAGE_MB}MB each
                </div>
                <input
                  ref={imgInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => {
                    addImages(e.target.files);
                    e.target.value = '';
                  }}
                />
              </div>

              {images.length > 0 && (
                <div className="cx-thumb-grid">
                  {images.map((img, i) => (
                    <div className="cx-thumb" key={img.url}>
                      <img
                        src={img.url}
                        alt={`Upload ${i + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        className="rm"
                        aria-label="Remove image"
                        onClick={() => removeImage(i)}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className={`cx-hint ${images.length >= MIN_IMAGES ? 'valid' : ''}`}>
                {images.length} of {MIN_IMAGES} minimum images added
              </div>
            </div>

            <div className="cx-card p-4 p-lg-5 mt-4">
              <h3 className="cx-h3 mb-1">Documentation & Media</h3>
              <p className="cx-small mb-3">
                Optional but recommended — helps faculty review your work faster.
              </p>
              <div className="row g-3">
                <div className="col-md-6">
                  <div
                    className="cx-dropzone"
                    style={{ padding: '28px 16px' }}
                    role="button"
                    tabIndex={0}
                    onClick={() => docInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ')
                        docInputRef.current?.click();
                    }}
                  >
                    <i
                      className="bi bi-file-earmark-pdf"
                      style={{ fontSize: '1.5rem', color: 'var(--c-muted)' }}
                    ></i>
                    <div className="cx-small mt-2 mb-0">
                      {docFile ? docFile.name : 'Upload Documentation (PDF)'}
                    </div>
                    <input
                      ref={docInputRef}
                      type="file"
                      accept="application/pdf"
                      hidden
                      onChange={(e) => setDocFile(e.target.files[0] ?? null)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div
                    className="cx-dropzone"
                    style={{ padding: '28px 16px' }}
                    role="button"
                    tabIndex={0}
                    onClick={() => videoInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ')
                        videoInputRef.current?.click();
                    }}
                  >
                    <i
                      className="bi bi-camera-reels"
                      style={{ fontSize: '1.5rem', color: 'var(--c-muted)' }}
                    ></i>
                    <div className="cx-small mt-2 mb-0">
                      {videoFile ? (
                        videoFile.name
                      ) : (
                        <>
                          Upload Screen Recording{' '}
                          <span className="cx-caption">(optional)</span>
                        </>
                      )}
                    </div>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      hidden
                      onChange={(e) => setVideoFile(e.target.files[0] ?? null)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex gap-3 mt-4">
              <button
                type="submit"
                className="cx-btn cx-btn-primary cx-btn-lg"
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit Project'}
              </button>
              <Link to="/student/projects" className="cx-btn cx-btn-outline cx-btn-lg">
                Cancel
              </Link>
            </div>
          </form>
        </div>

        <div className="col-lg-4">
          <div
            className="cx-glass p-4"
            style={{ position: 'sticky', top: 'calc(var(--topbar-h) + 20px)' }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-lightbulb" style={{ color: 'var(--c-accent)' }}></i>
              <span className="cx-label mb-0">Before you submit</span>
            </div>
            <ul className="cx-small ps-3 mb-0" style={{ lineHeight: 2 }}>
              <li>Write a clear, specific title — avoid generic names</li>
              <li>Describe the problem before the solution</li>
              <li>List every technology, even minor libraries</li>
              <li>5+ images improve reviewer engagement by 3×</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
