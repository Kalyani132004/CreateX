import React, { useRef, useState } from 'react';

/**
 * Reusable drag-and-drop file upload.
 *
 * Two modes, controlled by `multiple`:
 *
 * - multiple (image grid): `value` is an array of { file, url } objects,
 *   rendered as a removable thumbnail grid. Use for project image uploads.
 *
 *     const [images, setImages] = useState([]);
 *     <FileUpload
 *       label="Project Images" hint={`Upload a minimum of ${MIN} images.`}
 *       accept="image/*" multiple minFiles={5} maxSizeMB={10}
 *       value={images} onChange={setImages}
 *     />
 *
 * - single file: `value` is a File or null, rendered as the picked filename
 *   inside the dropzone. Use for a single PDF/video upload.
 *
 *     const [doc, setDoc] = useState(null);
 *     <FileUpload
 *       label="Documentation" accept="application/pdf" icon="bi-file-earmark-pdf"
 *       value={doc} onChange={setDoc}
 *     />
 */
export default function FileUpload({
  label,
  hint,
  accept,
  multiple = false,
  maxSizeMB = 10,
  minFiles = 0,
  required = false,
  icon = 'bi-cloud-arrow-up',
  placeholder = 'Drag files here, or ',
  value,
  onChange,
  onWarning, // optional (message) => void, e.g. to surface a toast on oversized/rejected files
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const uid = useRef(`fu-${Math.random().toString(36).slice(2, 9)}`).current;

  function warn(msg) {
    onWarning ? onWarning(msg) : console.warn(msg);
  }

  function acceptFiles(fileList) {
    const incoming = Array.from(fileList).filter((f) => {
      if (f.size > maxSizeMB * 1024 * 1024) {
        warn(`${f.name} is over ${maxSizeMB}MB and was skipped.`);
        return false;
      }
      return true;
    });
    if (!incoming.length) return;

    if (multiple) {
      const next = incoming.map((file) => ({ file, url: URL.createObjectURL(file) }));
      onChange([...(value ?? []), ...next]);
    } else {
      onChange(incoming[0]);
    }
  }

  function removeAt(index) {
    const current = value ?? [];
    URL.revokeObjectURL(current[index].url);
    onChange(current.filter((_, i) => i !== index));
  }

  function clearSingle() {
    onChange(null);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) acceptFiles(e.dataTransfer.files);
  }

  const count = multiple ? (value ?? []).length : value ? 1 : 0;
  const belowMin = multiple && minFiles > 0 && count < minFiles;

  return (
    <div>
      {label && (
        <label htmlFor={uid} className="cx-label d-block mb-2">
          {label} {required && <span className="req">*</span>}
        </label>
      )}

      <div
        className={`cx-dropzone ${dragging ? 'drag' : ''}`}
        role="button"
        tabIndex={0}
        aria-label={label || 'Upload files'}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={!multiple ? { padding: '28px 16px' } : undefined}
      >
        <i className={`bi ${icon}`} style={{ fontSize: multiple ? '1.8rem' : '1.5rem', color: 'var(--c-muted)' }} aria-hidden="true"></i>

        {multiple ? (
          <>
            <div className="cx-small mt-2 mb-0">{placeholder}<span className="cx-link">browse files</span></div>
            <div className="cx-caption mt-1">Up to {maxSizeMB}MB each</div>
          </>
        ) : (
          <div className="cx-small mt-2 mb-0">
            {value ? value.name : <>{placeholder}<span className="cx-link">browse files</span></>}
          </div>
        )}

        <input
          ref={inputRef} id={uid} type="file" accept={accept} multiple={multiple} hidden
          onChange={(e) => { acceptFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {multiple && count > 0 && (
        <div className="cx-thumb-grid">
          {value.map((img, i) => (
            <div className="cx-thumb" key={img.url}>
              <img src={img.url} alt={`Upload ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button type="button" className="rm" aria-label="Remove image" onClick={() => removeAt(i)}>
                <i className="bi bi-x"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {!multiple && value && (
        <button type="button" className="cx-btn cx-btn-ghost cx-btn-sm mt-2" onClick={clearSingle}>
          <i className="bi bi-x"></i>Remove file
        </button>
      )}

      {(hint || minFiles > 0) && (
        <div className={`cx-hint ${multiple && minFiles > 0 ? (belowMin ? '' : 'valid') : ''}`}>
          {minFiles > 0 ? `${count} of ${minFiles} minimum images added` : hint}
        </div>
      )}
    </div>
  );
}
