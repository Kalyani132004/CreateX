import React, { useEffect, useRef } from 'react';
import { Modal } from 'bootstrap';

/**
 * Controlled confirmation dialog for destructive/irreversible actions
 * ("Are you sure you want to delete this project?"). Unlike the
 * uncontrolled data-bs-toggle modals used elsewhere (edit profile, etc.),
 * this is driven entirely by the `show` prop so a single instance can be
 * reused for any row in a list (pass the pending item's id/title into
 * `message` rather than mounting one modal per row).
 *
 * @example
 * const [pendingDelete, setPendingDelete] = useState(null); // project or null
 * const [deleting, setDeleting] = useState(false);
 *
 * async function confirmDelete() {
 *   setDeleting(true);
 *   try {
 *     await projectService.remove(pendingDelete.id);
 *     toast('Project deleted.');
 *     setPendingDelete(null);
 *   } catch (err) {
 *     toast(err.message || 'Could not delete this project.', 'error');
 *   } finally {
 *     setDeleting(false);
 *   }
 * }
 *
 * <ConfirmDialog
 *   show={!!pendingDelete}
 *   title="Delete this project?"
 *   message={`"${pendingDelete?.title}" will be permanently removed. This action cannot be undone.`}
 *   confirmLabel="Delete"
 *   variant="danger"
 *   loading={deleting}
 *   onConfirm={confirmDelete}
 *   onCancel={() => setPendingDelete(null)}
 * />
 */
export default function ConfirmDialog({
  show,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'primary'
  loading = false,
  onConfirm,
  onCancel,
}) {
  const elRef = useRef(null);
  const modalRef = useRef(null);
  const uid = useRef(`confirm-${Math.random().toString(36).slice(2, 9)}`).current;

  // Mount the Bootstrap Modal instance once; sync open/closed state to `show`.
  useEffect(() => {
    modalRef.current = Modal.getOrCreateInstance(elRef.current, { backdrop: 'static' });

    // Dismissing via backdrop click / Escape / the header's X button all fire
    // this event too — treat it the same as clicking Cancel so parent state
    // (e.g. `pendingDelete`) stays in sync with what's actually on screen.
    const el = elRef.current;
    function handleHidden() {
      onCancel?.();
    }
    el.addEventListener('hidden.bs.modal', handleHidden);

    return () => {
      el.removeEventListener('hidden.bs.modal', handleHidden);
      modalRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (show) modalRef.current?.show();
    else modalRef.current?.hide();
  }, [show]);

  function handleConfirmClick() {
    onConfirm?.();
  }

  return (
    <div
      className="modal fade" id={uid} tabIndex="-1"
      aria-labelledby={`${uid}-label`} aria-hidden="true" ref={elRef}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ borderRadius: 'var(--r-lg)', border: '1px solid var(--c-border-soft)' }}>
          <div className="modal-body pt-4 px-4">
            <div className="d-flex align-items-start gap-3">
              <div
                style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: variant === 'danger' ? 'var(--c-danger-soft)' : 'var(--c-primary-soft)',
                  color: variant === 'danger' ? 'var(--c-danger)' : 'var(--c-primary)',
                }}
              >
                <i className={`bi ${variant === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-question-circle-fill'}`}></i>
              </div>
              <div>
                <h3 className="cx-h3 mb-1" id={`${uid}-label`}>{title}</h3>
                {message && <p className="cx-small mb-0">{message}</p>}
              </div>
            </div>
          </div>
          <div className="modal-footer" style={{ borderTop: 'none' }}>
            <button
              type="button" className="cx-btn cx-btn-outline"
              onClick={onCancel} disabled={loading}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`cx-btn ${variant === 'danger' ? 'cx-btn-danger-outline' : 'cx-btn-primary'}`}
              style={variant === 'danger' ? { background: 'var(--c-danger)', color: '#fff', borderColor: 'var(--c-danger)' } : undefined}
              onClick={handleConfirmClick}
              disabled={loading}
            >
              {loading && <span className="spinner-border spinner-border-sm" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
