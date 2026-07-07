import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const mouseDownTargetRef = useRef(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      // Only unset if there are no other backdrops open
      const otherModals = document.querySelectorAll('.modal-backdrop');
      if (otherModals.length <= 1) {
        document.body.style.overflow = 'unset';
      }
    }
    return () => {
      const otherModals = document.querySelectorAll('.modal-backdrop');
      if (otherModals.length <= 1) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMouseDown = (e) => {
    mouseDownTargetRef.current = e.target;
  };

  const handleMouseUp = (e) => {
    if (
      mouseDownTargetRef.current?.classList.contains('modal-backdrop') &&
      e.target.classList.contains('modal-backdrop')
    ) {
      onClose();
    }
    mouseDownTargetRef.current = null;
  };

  return (
    <div 
      className="modal-backdrop" 
      onMouseDown={handleMouseDown} 
      onMouseUp={handleMouseUp}
    >
      <div className={`modal-container size-${size} animate-scale-up`}>
        {/* Modal Header */}
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-content">
          {children}
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(18, 40, 20, 0.4); /* Transparent primary-dark backdrop */
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1000;
          animation: fadeInBackdrop 0.25s ease-out forwards;
        }

        .modal-container {
          background-color: white;
          border-radius: var(--radius-lg);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(30, 70, 32, 0.1);
        }

        .size-sm { max-width: 480px; }
        .size-md { max-width: 680px; }
        .size-lg { max-width: 900px; }
        .size-full { max-width: 1100px; }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid var(--color-border);
          background-color: var(--color-bg-body);
        }

        .modal-title {
          font-size: 1.25rem;
          color: var(--color-primary);
          font-weight: 600;
          margin: 0;
        }

        .modal-close-btn {
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-fast);
        }

        .modal-close-btn:hover {
          background-color: var(--color-border);
          color: var(--color-text-heading);
        }

        .modal-body-content {
          padding: 24px;
          overflow-y: auto;
          flex-grow: 1;
        }

        /* Animations */
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .animate-scale-up {
          animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @media (max-width: 600px) {
          .modal-backdrop {
            padding: 10px;
          }
          .modal-container {
            max-height: 95vh;
          }
          .modal-body-content {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}
