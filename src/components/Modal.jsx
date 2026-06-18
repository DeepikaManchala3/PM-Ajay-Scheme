import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * Modal component (renders into document.body using a portal)
 *
 * Props:
 *  - isOpen: boolean (show/hide)
 *  - onClose: function (called when overlay or close button clicked)
 *  - title: React node or string
 *  - children: React node (modal body)
 *  - footer: React node (modal footer actions)
 *
 * Behavior:
 *  - Locks body scroll while open
 *  - Stops propagation of clicks inside the modal
 *  - Closes when clicking overlay or clicking the close button
 */
const Modal = ({ isOpen, onClose, title, children, footer }) => {
    // Prevent body scroll while modal is open
    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = typeof document !== 'undefined' ? document.body.style.overflow : '';
        if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
        return () => {
            if (typeof document !== 'undefined') document.body.style.overflow = originalOverflow || '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const modalElement = (
        <div
            className="modal-overlay"
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2147483647, // very high z-index to avoid stacking context issues
            }}
            onClick={onClose}
        >
            <div
                className="modal-content"
                role="dialog"
                aria-modal="true"
                style={{
                    minWidth: 320,
                    maxWidth: '900px',
                    width: '90%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    backgroundColor: 'var(--bg-primary, #fff)', // fallback to white
                    borderRadius: '8px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    position: 'relative',
                    padding: '20px',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div
                        className="modal-header"
                        style={{
                            marginBottom: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <h3 style={{ margin: 0 }}>{title}</h3>
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 20,
                                lineHeight: 1,
                                padding: 4,
                            }}
                        >
                            ×
                        </button>
                    </div>
                )}

                <div className="modal-body" style={{ marginBottom: 16 }}>
                    {children}
                </div>

                {footer && (
                    <div
                        className="modal-footer"
                        style={{
                            paddingTop: 8,
                            borderTop: '1px solid rgba(0,0,0,0.06)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 12,
                        }}
                    >
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );

    // guard for SSR / non-browser env
    if (typeof document === 'undefined') return modalElement;

    return ReactDOM.createPortal(modalElement, document.body);
};

export default Modal;
