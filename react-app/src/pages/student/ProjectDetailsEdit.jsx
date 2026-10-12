// import { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { useToast } from '../../context/ToastContext';
// import { projectService } from '../../services/projectService';

// export default function ProjectDetailsEdit() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [form, setForm] = useState({
//     title: '',
//     description: '',
//     domain: '',
//     course: '',
//     batch: '',
//     technologies: [],
//   });

//   const [technologyInput, setTechnologyInput] = useState('');

//   // ==========================================
//   // LOAD EXISTING PROJECT DATA
//   // ==========================================
//   useEffect(() => {
//     async function loadProject() {
//       try {
//         setLoading(true);

//         // GET /projects/:id/
//         const res = await projectService.detail(id);

//         const project = res.data;

//         // Automatically fill form with previous data
//         setForm({
//           title: project.title || '',
//           description: project.description || '',
//           domain: project.domain || '',
//           course: project.course || '',
//           batch: project.batch || '',
//           technologies: project.technologies || [],
//         });
//       } catch (err) {
//         console.error(err);

//         toast(err.response?.data?.detail || 'Could not load project.', 'error');
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadProject();
//   }, [id, toast]);

//   // ==========================================
//   // INPUT CHANGE
//   // ==========================================
//   function handleChange(e) {
//     const { name, value } = e.target;

//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   }

//   // ==========================================
//   // ADD TECHNOLOGY
//   // ==========================================
//   function addTechnology() {
//     const technology = technologyInput.trim();

//     if (!technology) return;

//     if (form.technologies.includes(technology)) {
//       setTechnologyInput('');
//       return;
//     }

//     setForm((prev) => ({
//       ...prev,
//       technologies: [...prev.technologies, technology],
//     }));

//     setTechnologyInput('');
//   }

//   // ==========================================
//   // REMOVE TECHNOLOGY
//   // ==========================================
//   function removeTechnology(technology) {
//     setForm((prev) => ({
//       ...prev,
//       technologies: prev.technologies.filter((item) => item !== technology),
//     }));
//   }

//   // ==========================================
//   // UPDATE PROJECT
//   // ==========================================
//   async function handleSubmit(e) {
//     e.preventDefault();

//     try {
//       setSaving(true);

//       const formData = new FormData();

//       formData.append('title', form.title);
//       formData.append('description', form.description);
//       formData.append('domain', form.domain);
//       formData.append('course', form.course);
//       formData.append('batch', form.batch);

//       // IMPORTANT: JSONField
//       formData.append('technologies', JSON.stringify(form.technologies));

//       await projectService.update(id, formData);

//       toast('Project updated successfully.', 'success');
//       navigate('/student/projects/:id');
//     } catch (err) {
//       console.error(err);

//       toast(err.response?.data?.detail || 'Could not update project.', 'error');
//     } finally {
//       setSaving(false);
//     }
//   }

//   // ==========================================
//   // LOADING
//   // ==========================================
//   if (loading) {
//     return (
//       <div className="text-center py-5">
//         <div className="spinner-border" />

//         <p className="cx-small mt-3">Loading project...</p>
//       </div>
//     );
//   }

//   // ==========================================
//   // PAGE
//   // ==========================================
//   return (
//     <div>
//       {/* Header */}
//       <div className="mb-4">
//         <h1 className="cx-h1 mb-1">Edit Project</h1>

//         <p className="cx-body mb-0">Update your project information.</p>
//       </div>

//       <form onSubmit={handleSubmit}>
//         <div className="cx-card p-4">
//           {/* TITLE */}
//           <div className="mb-3">
//             <label className="form-label">Project Title</label>

//             <input
//               type="text"
//               name="title"
//               className="form-control"
//               value={form.title}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* DESCRIPTION */}
//           <div className="mb-3">
//             <label className="form-label">Description</label>

//             <textarea
//               name="description"
//               rows="5"
//               className="form-control"
//               value={form.description}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* DOMAIN */}
//           <div className="mb-3">
//             <label className="form-label">Domain</label>

//             <select
//               name="domain"
//               className="form-select"
//               value={form.domain}
//               onChange={handleChange}
//               required
//             >
//               <option value="">Select Domain</option>

//               <option value="Web Development">Web Development</option>

//               <option value="Mobile Application">Mobile Application</option>

//               <option value="Data Science">Data Science</option>

//               <option value="AI / ML">AI / ML</option>

//               <option value="Cyber Security">Cyber Security</option>

//               <option value="IoT">IoT</option>

//               <option value="Cloud Computing">Cloud Computing</option>

//               <option value="Software Development">Software Development</option>
//             </select>
//           </div>

//           {/* COURSE */}
//           <div className="mb-3">
//             <label className="form-label">Course</label>

//             <select
//               name="course"
//               className="form-select"
//               value={form.course}
//               onChange={handleChange}
//               required
//             >
//               <option value="">Select Course</option>

//               <option value="MCA">MCA</option>
//               <option value="BCA">BCA</option>
//               <option value="BE">BE</option>
//               <option value="BTECH">BTECH</option>
//             </select>
//           </div>

//           {/* BATCH */}
//           <div className="mb-3">
//             <label className="form-label">Batch</label>

//             <input
//               type="text"
//               name="batch"
//               className="form-control"
//               value={form.batch}
//               onChange={handleChange}
//               placeholder="2023-2026"
//             />
//           </div>

//           {/* TECHNOLOGIES */}
//           <div className="mb-3">
//             <label className="form-label">Technologies</label>

//             <div className="d-flex gap-2">
//               <input
//                 type="text"
//                 className="form-control"
//                 value={technologyInput}
//                 onChange={(e) => setTechnologyInput(e.target.value)}
//                 placeholder="e.g. Django"
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter') {
//                     e.preventDefault();
//                     addTechnology();
//                   }
//                 }}
//               />

//               <button
//                 type="button"
//                 className="cx-btn cx-btn-outline"
//                 onClick={addTechnology}
//               >
//                 Add
//               </button>
//             </div>

//             {/* Existing + New Technologies */}
//             <div className="d-flex flex-wrap gap-2 mt-3">
//               {form.technologies.map((technology) => (
//                 <span
//                   key={technology}
//                   className="badge bg-secondary d-flex align-items-center gap-2"
//                 >
//                   {technology}

//                   <button
//                     type="button"
//                     className="btn-close btn-close-white"
//                     style={{ fontSize: '8px' }}
//                     onClick={() => removeTechnology(technology)}
//                   />
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* BUTTONS */}
//           <div className="d-flex gap-2 mt-4">
//             <button
//               type="button"
//               className="cx-btn cx-btn-outline"
//               onClick={() => navigate('/student/projects')}
//               disabled={saving}
//             >
//               Cancel
//             </button>

//             <button type="submit" className="cx-btn cx-btn-primary" disabled={saving}>
//               {saving ? (
//                 <>
//                   <span className="spinner-border spinner-border-sm me-2" />
//                   Updating...
//                 </>
//               ) : (
//                 <>
//                   <i className="bi bi-check-lg me-1" />
//                   Update Project
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { projectService } from '../../services/projectService';
import '../../styles/ProjectDetailsEdit.css';

/* =========================================================
   CONFIG — adjust to match your backend
========================================================= */

/*
  FormData field names sent to projectService.update().
  `images`, `documentation` and `screen_recording` mirror the fields your
  details page reads. The remove_* names are NEW: your serializer/view must
  accept them (see the notes that came with this file).
*/
const FIELDS = {
  newImages: 'images',
  removeImages: 'remove_image_ids',
  documentation: 'documentation',
  removeDocumentation: 'remove_documentation',
  recording: 'screen_recording',
  removeRecording: 'remove_screen_recording',
};

const LIMITS = {
  maxImages: 8,
  imageMB: 5,
  docMB: 10,
  videoMB: 100,
};

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

const DOC_TYPES = /\.(pdf|docx?|pptx?)$/i;

/* =========================================================
   HELPERS
========================================================= */

function toTechList(value) {
  const list = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];
  return [...new Set(list.map((t) => String(t).trim()).filter(Boolean))];
}

function toExistingImages(images) {
  if (!Array.isArray(images)) return [];
  return images
    .map((img, i) => {
      const src = typeof img === 'string' ? img : img?.image || img?.url;
      return src ? { id: typeof img === 'object' ? (img.id ?? null) : null, src, key: `${img?.id ?? 'i'}-${i}` } : null;
    })
    .filter(Boolean);
}

function fileSize(bytes) {
  return bytes >= 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function fileNameFromUrl(url) {
  try {
    return decodeURIComponent(url.split('?')[0].split('/').pop()) || 'Current file';
  } catch {
    return 'Current file';
  }
}

// Returns an error string, or '' when the file is acceptable.
function checkFile(file, kind) {
  if (kind === 'image') {
    if (!file.type.startsWith('image/')) return `${file.name} is not an image.`;
    if (file.size > LIMITS.imageMB * 1048576)
      return `${file.name} is larger than ${LIMITS.imageMB} MB.`;
  }
  if (kind === 'doc') {
    if (!DOC_TYPES.test(file.name)) return 'Use a PDF, Word or PowerPoint file.';
    if (file.size > LIMITS.docMB * 1048576) return `Documentation must be under ${LIMITS.docMB} MB.`;
  }
  if (kind === 'video') {
    if (!file.type.startsWith('video/')) return 'Use a video file.';
    if (file.size > LIMITS.videoMB * 1048576) return `Recording must be under ${LIMITS.videoMB} MB.`;
  }
  return '';
}

// DRF errors: { detail } or { field: ['msg'] }
function errorMessage(err, fallback) {
  const data = err?.response?.data;
  if (data?.detail) return data.detail;
  if (data && typeof data === 'object') {
    const [field, msgs] = Object.entries(data)[0] || [];
    const msg = Array.isArray(msgs) ? msgs[0] : msgs;
    if (msg) return `${field}: ${msg}`;
  }
  return err?.message || fallback;
}

const inflight = new Map();
function fetchProject(id) {
  if (!inflight.has(id)) {
    inflight.set(id, projectService.detail(id).finally(() => inflight.delete(id)));
  }
  return inflight.get(id);
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function Section({ id, title, hint, children }) {
  return (
    <section className="cx-card pe-section" aria-labelledby={id}>
      <div className="pe-section-head">
        <h2 id={id} className="cx-h3">{title}</h2>
        {hint && <p className="cx-small mb-0">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

// Single-file picker for documentation / recording.
function SingleFile({ id, label, accept, state, setState, onPick, existingLabel, icon }) {
  const hasCurrent = state.url && !state.remove && !state.file;
  return (
    <div className="pe-file">
      <div className="pe-file-label">{label}</div>

      {state.file ? (
        <div className="pe-file-row">
          <i className={`bi ${icon}`} aria-hidden="true" />
          <span className="pe-file-name">
            {state.file.name} <small>({fileSize(state.file.size)}) · will replace current</small>
          </span>
          <button type="button" className="cx-btn cx-btn-ghost cx-btn-sm" onClick={() => setState((s) => ({ ...s, file: null }))}>
            Undo
          </button>
        </div>
      ) : state.remove ? (
        <div className="pe-file-row pe-file-row--removed">
          <i className={`bi ${icon}`} aria-hidden="true" />
          <span className="pe-file-name">{existingLabel} will be removed</span>
          <button type="button" className="cx-btn cx-btn-ghost cx-btn-sm" onClick={() => setState((s) => ({ ...s, remove: false }))}>
            Undo
          </button>
        </div>
      ) : hasCurrent ? (
        <div className="pe-file-row">
          <i className={`bi ${icon}`} aria-hidden="true" />
          <a className="pe-file-name" href={state.url} target="_blank" rel="noreferrer">
            {fileNameFromUrl(state.url)}
          </a>
          <button type="button" className="cx-btn cx-btn-ghost cx-btn-sm" onClick={() => setState((s) => ({ ...s, remove: true }))}>
            Remove
          </button>
        </div>
      ) : (
        <p className="cx-small mb-2">Nothing uploaded yet.</p>
      )}

      <label className="cx-btn cx-btn-outline cx-btn-sm pe-pick" htmlFor={id}>
        <i className="bi bi-upload" aria-hidden="true" /> {state.url || state.file ? 'Replace file' : 'Choose file'}
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        className="pe-sr"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) onPick(file);
        }}
      />
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function ProjectDetailsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Keep toast out of effect deps so a toast can never re-trigger loading.
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const viewPath = `/student/projects/view/${id}`;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', domain: '', course: '', batch: '', technologies: [],
  });
  const [initialJson, setInitialJson] = useState('');
  const [technologyInput, setTechnologyInput] = useState('');

  // Media
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState(() => new Set());
  const [newImages, setNewImages] = useState([]); // { key, file, url }
  const [doc, setDoc] = useState({ url: '', file: null, remove: false });
  const [rec, setRec] = useState({ url: '', file: null, remove: false });
  const [dragging, setDragging] = useState(false);

  /* ------------------------ LOAD ------------------------ */

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');

    fetchProject(id)
      .then((res) => {
        if (cancelled) return;
        const p = res.data;
        const next = {
          title: p.title || '',
          description: p.description || '',
          domain: p.domain || '',
          course: p.course || '',
          batch: p.batch || '',
          technologies: toTechList(p.technologies),
        };
        setForm(next);
        setInitialJson(JSON.stringify(next));
        setExistingImages(toExistingImages(p.images));
        setDoc({ url: p.documentation || '', file: null, remove: false });
        setRec({ url: p.screen_recording || '', file: null, remove: false });
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = errorMessage(err, 'Could not load project.');
        setLoadError(msg);
        toastRef.current(msg, 'error');
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  // Release object URLs for previews on unmount.
  const newImagesRef = useRef(newImages);
  newImagesRef.current = newImages;
  useEffect(() => () => newImagesRef.current.forEach((i) => URL.revokeObjectURL(i.url)), []);

  /* ------------------- DERIVED / DIRTY ------------------- */

  const detailsChanged = initialJson !== '' && JSON.stringify(form) !== initialJson;
  const mediaChanges = {
    added: newImages.length,
    removed: removedImageIds.size,
    doc: Boolean(doc.file || doc.remove),
    rec: Boolean(rec.file || rec.remove),
  };
  const mediaChanged =
    mediaChanges.added > 0 || mediaChanges.removed > 0 || mediaChanges.doc || mediaChanges.rec;
  const dirty = detailsChanged || mediaChanged;
  const imageCount = existingImages.length - removedImageIds.size + newImages.length;

  // Warn on tab close / refresh with unsaved edits.
  useEffect(() => {
    if (!dirty || saving) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, saving]);

  /* ------------------- FORM HANDLERS ------------------- */

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function addTechnology() {
    const incoming = technologyInput.split(',').map((t) => t.trim()).filter(Boolean);
    if (!incoming.length) return;

    setForm((prev) => {
      const lower = new Set(prev.technologies.map((t) => t.toLowerCase()));
      const fresh = incoming.filter((t) => !lower.has(t.toLowerCase()) && lower.add(t.toLowerCase()));
      return fresh.length ? { ...prev, technologies: [...prev.technologies, ...fresh] } : prev;
    });
    setTechnologyInput('');
  }

  function removeTechnology(technology) {
    setForm((prev) => ({ ...prev, technologies: prev.technologies.filter((t) => t !== technology) }));
  }

  /* ------------------- MEDIA HANDLERS ------------------- */

  function addImages(fileList) {
    const files = Array.from(fileList || []);
    let room = LIMITS.maxImages - imageCount;
    const accepted = [];

    for (const file of files) {
      const problem = checkFile(file, 'image');
      if (problem) {
        toast(problem, 'error');
      } else if (room <= 0) {
        toast(`You can have up to ${LIMITS.maxImages} images.`, 'error');
        break;
      } else {
        accepted.push({ key: `${file.name}-${file.size}-${file.lastModified}-${accepted.length}-${Date.now()}`, file, url: URL.createObjectURL(file) });
        room -= 1;
      }
    }
    if (accepted.length) setNewImages((prev) => [...prev, ...accepted]);
  }

  function dropNewImage(key) {
    setNewImages((prev) => {
      const target = prev.find((i) => i.key === key);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((i) => i.key !== key);
    });
  }

  function toggleExistingImage(imgId) {
    setRemovedImageIds((prev) => {
      const next = new Set(prev);
      if (next.has(imgId)) next.delete(imgId);
      else next.add(imgId);
      return next;
    });
  }

  function pickSingle(kind, setState) {
    return (file) => {
      const problem = checkFile(file, kind);
      if (problem) toast(problem, 'error');
      else setState((s) => ({ ...s, file, remove: false }));
    };
  }

  /* ------------------------ SUBMIT ------------------------ */

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;

    if (!form.title.trim() || !form.description.trim()) {
      toast('Title and description are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('domain', form.domain);
      formData.append('course', form.course);
      formData.append('batch', form.batch);
      formData.append('technologies', JSON.stringify(form.technologies)); // JSONField

      // Media: only fields that actually changed are sent.
      newImages.forEach((i) => formData.append(FIELDS.newImages, i.file));
      removedImageIds.forEach((imgId) => formData.append(FIELDS.removeImages, imgId));

      if (doc.file) formData.append(FIELDS.documentation, doc.file);
      else if (doc.remove) formData.append(FIELDS.removeDocumentation, 'true');

      if (rec.file) formData.append(FIELDS.recording, rec.file);
      else if (rec.remove) formData.append(FIELDS.removeRecording, 'true');

      await projectService.update(id, formData);

      toast('Project updated successfully.', 'success');
      // Mark clean first so the unload guard doesn't fire on navigation.
      setInitialJson(JSON.stringify(form));
      newImages.forEach((i) => URL.revokeObjectURL(i.url));
      setNewImages([]);
      setRemovedImageIds(new Set());
      setDoc((s) => ({ ...s, file: null, remove: false }));
      setRec((s) => ({ ...s, file: null, remove: false }));
      navigate(viewPath);
    } catch (err) {
      console.error(err);
      toast(errorMessage(err, 'Could not update project.'), 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (dirty && !window.confirm('Discard your unsaved changes?')) return;
    navigate(viewPath);
  }

  /* ------------------------ STATES ------------------------ */

  if (loading) {
    return (
      <div aria-busy="true" aria-label="Loading project">
        <div className="cx-skel pe-skel-title" />
        <div className="row g-4">
          <div className="col-lg-8"><div className="cx-skel pe-skel-block" /></div>
          <div className="col-lg-4"><div className="cx-skel pe-skel-side" /></div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="cx-empty" role="alert">
        <div className="cx-empty-icon"><i className="bi bi-exclamation-circle" aria-hidden="true" /></div>
        <h2 className="cx-h3">Couldn&rsquo;t load this project</h2>
        <p className="cx-small mb-3">{loadError}</p>
        <div className="d-flex gap-2 justify-content-center">
          <button type="button" className="cx-btn cx-btn-primary" onClick={() => setAttempt((n) => n + 1)}>Retry</button>
          <button type="button" className="cx-btn cx-btn-outline" onClick={() => navigate(-1)}>Go back</button>
        </div>
      </div>
    );
  }

  // Keep a saved value selectable even if it's not in the preset list.
  const courseOptions = form.course && !COURSES.includes(form.course) ? [form.course, ...COURSES] : COURSES;
  const domainOptions = form.domain && !DOMAINS.includes(form.domain) ? [form.domain, ...DOMAINS] : DOMAINS;

  const summary = [
    detailsChanged && 'Project details edited',
    mediaChanges.added > 0 && `${mediaChanges.added} image${mediaChanges.added > 1 ? 's' : ''} added`,
    mediaChanges.removed > 0 && `${mediaChanges.removed} image${mediaChanges.removed > 1 ? 's' : ''} removed`,
    mediaChanges.doc && (doc.file ? 'Documentation replaced' : 'Documentation removed'),
    mediaChanges.rec && (rec.file ? 'Screen recording replaced' : 'Screen recording removed'),
  ].filter(Boolean);

  /* ------------------------ RENDER ------------------------ */

  return (
    <form onSubmit={handleSubmit} noValidate={false}>
      <header className="pe-header">
        <button type="button" className="pe-back" onClick={handleCancel}>
          <i className="bi bi-arrow-left" aria-hidden="true" /> Back to project
        </button>
        <h1 className="cx-h1 mb-1">Edit project</h1>
        <p className="cx-body mb-0">Update your project&rsquo;s details and media.</p>
      </header>

      <div className="row g-4">
        <div className="col-lg-8">
          {/* ---------------- BASICS ---------------- */}
          <Section id="pe-basics" title="Project details">
            <div className="pe-grid">
              <div className="pe-span-2">
                <label className="form-label" htmlFor="pe-title">Project title</label>
                <input id="pe-title" type="text" name="title" className="form-control" value={form.title} onChange={handleChange} maxLength={150} required />
              </div>

              <div className="pe-span-2">
                <label className="form-label" htmlFor="pe-desc">Description</label>
                <textarea id="pe-desc" name="description" rows="6" className="form-control" value={form.description} onChange={handleChange} required />
                <div className="pe-count">{form.description.length} characters</div>
              </div>

              <div>
                <label className="form-label" htmlFor="pe-domain">Domain</label>
                <select id="pe-domain" name="domain" className="form-select" value={form.domain} onChange={handleChange} required>
                  <option value="">Select domain</option>
                  {domainOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="form-label" htmlFor="pe-course">Course</label>
                <select id="pe-course" name="course" className="form-select" value={form.course} onChange={handleChange} required>
                  <option value="">Select course</option>
                  {courseOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="pe-span-2">
                <label className="form-label" htmlFor="pe-batch">Batch</label>
                <input id="pe-batch" type="text" name="batch" className="form-control" value={form.batch} onChange={handleChange} placeholder="2023-2026" />
              </div>
            </div>
          </Section>

          {/* ---------------- TECHNOLOGIES ---------------- */}
          <Section id="pe-tech" title="Technologies" hint="Press Enter or comma to add. Paste a comma-separated list to add several.">
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                aria-label="Add technology"
                value={technologyInput}
                onChange={(e) => setTechnologyInput(e.target.value)}
                placeholder="e.g. Django"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTechnology();
                  }
                }}
              />
              <button type="button" className="cx-btn cx-btn-outline" onClick={addTechnology}>Add</button>
            </div>

            {form.technologies.length > 0 ? (
              <ul className="pe-chips">
                {form.technologies.map((t) => (
                  <li key={t} className="pe-chip">
                    {t}
                    <button type="button" aria-label={`Remove ${t}`} onClick={() => removeTechnology(t)}>
                      <i className="bi bi-x" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="cx-small mt-3 mb-0">No technologies added yet.</p>
            )}
          </Section>

          {/* ---------------- IMAGES ---------------- */}
          <Section id="pe-images" title="Images" hint={`${imageCount} of ${LIMITS.maxImages} · JPG, PNG or WebP up to ${LIMITS.imageMB} MB each. The first image is used as the cover.`}>
            {(existingImages.length > 0 || newImages.length > 0) && (
              <ul className="pe-images">
                {existingImages.map((img) => {
                  const removed = img.id != null && removedImageIds.has(img.id);
                  return (
                    <li key={img.key} className={`pe-img ${removed ? 'is-removed' : ''}`}>
                      <img src={img.src} alt="" loading="lazy" />
                      {removed && <span className="pe-tag pe-tag--warn">Will be removed</span>}
                      {img.id != null ? (
                        <button type="button" className="pe-img-btn" aria-label={removed ? 'Keep this image' : 'Remove this image'} onClick={() => toggleExistingImage(img.id)}>
                          <i className={`bi ${removed ? 'bi-arrow-counterclockwise' : 'bi-trash3'}`} aria-hidden="true" />
                        </button>
                      ) : null}
                    </li>
                  );
                })}

                {newImages.map((img) => (
                  <li key={img.key} className="pe-img">
                    <img src={img.url} alt="" />
                    <span className="pe-tag">New</span>
                    <button type="button" className="pe-img-btn" aria-label={`Discard ${img.file.name}`} onClick={() => dropNewImage(img.key)}>
                      <i className="bi bi-x-lg" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <label
              className={`pe-drop ${dragging ? 'is-over' : ''} ${imageCount >= LIMITS.maxImages ? 'is-full' : ''}`}
              htmlFor="pe-image-input"
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addImages(e.dataTransfer.files); }}
            >
              <i className="bi bi-images" aria-hidden="true" />
              <span><strong>Add images</strong> or drag them here</span>
            </label>
            <input
              id="pe-image-input"
              type="file"
              accept="image/*"
              multiple
              className="pe-sr"
              disabled={imageCount >= LIMITS.maxImages}
              onChange={(e) => { addImages(e.target.files); e.target.value = ''; }}
            />
          </Section>

          {/* ---------------- DOCS + VIDEO ---------------- */}
          <Section id="pe-files" title="Documentation & screen recording">
            <div className="pe-grid">
              <SingleFile
                id="pe-doc"
                label="Documentation"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                icon="bi-file-earmark-pdf"
                existingLabel="Documentation"
                state={doc}
                setState={setDoc}
                onPick={pickSingle('doc', setDoc)}
              />
              <SingleFile
                id="pe-rec"
                label="Screen recording"
                accept="video/*"
                icon="bi-play-circle"
                existingLabel="Screen recording"
                state={rec}
                setState={setRec}
                onPick={pickSingle('video', setRec)}
              />
            </div>
          </Section>
        </div>

        {/* ---------------- SIDEBAR ---------------- */}
        <aside className="col-lg-4">
          <div className="cx-glass pe-actions">
            <h2 className="cx-label mb-3">Changes</h2>

            {summary.length > 0 ? (
              <ul className="pe-summary">
                {summary.map((s) => <li key={s}><i className="bi bi-dot" aria-hidden="true" />{s}</li>)}
              </ul>
            ) : (
              <p className="cx-small">No changes yet.</p>
            )}

            {saving && mediaChanged && (
              <p className="pe-note" role="status">Uploading files — please keep this page open.</p>
            )}

            <div className="d-grid gap-2 mt-3">
              <button type="submit" className="cx-btn cx-btn-primary" disabled={saving || !dirty}>
                {saving ? (
                  <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Saving…</>
                ) : (
                  <><i className="bi bi-check-lg me-1" aria-hidden="true" />Save changes</>
                )}
              </button>
              <button type="button" className="cx-btn cx-btn-outline" onClick={handleCancel} disabled={saving}>
                Cancel
              </button>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
