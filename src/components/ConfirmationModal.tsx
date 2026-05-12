import React, { useId } from 'react';
import './ConfirmationModal.css';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** `actionLayout`이 `default`일 때 필수 */
  onConfirm?: () => void;
  /** 주요 질문/제목 (필수) */
  question: string;
  /** 부가 설명 — 없으면 블록 미렌더. 줄바꿈은 `\n` + `.modal-info--preline` */
  info?: string | null;
  isLoading?: boolean;
  cancelLabel?: string;
  confirmLabel?: string;
  /** isLoading일 때 확인 버튼에 표시할 문구 (미지정 시 confirmLabel 유지) */
  confirmPendingLabel?: string;
  /**
   * `twin`: 좌·우 동일 폭 버튼 (예: 나만 볼래요 / 공개 할래요).
   * 이 경우 `onTwinLeft`, `onTwinRight`, 라벨 4개가 모두 있어야 함.
   */
  actionLayout?: 'default' | 'twin';
  twinLeftLabel?: string;
  twinRightLabel?: string;
  onTwinLeft?: () => void;
  onTwinRight?: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  question,
  info,
  isLoading = false,
  cancelLabel = '취소하기',
  confirmLabel = '확인',
  confirmPendingLabel,
  actionLayout = 'default',
  twinLeftLabel,
  twinRightLabel,
  onTwinLeft,
  onTwinRight,
}) => {
  const id = useId();
  const questionId = `confirmation-q-${id}`;
  const infoId = `confirmation-info-${id}`;

  if (!isOpen) return null;

  const isTwin =
    actionLayout === 'twin' &&
    twinLeftLabel != null &&
    twinRightLabel != null &&
    onTwinLeft != null &&
    onTwinRight != null;

  if (!isTwin && onConfirm == null) {
    return null;
  }

  const confirmText = isLoading ? (confirmPendingLabel ?? confirmLabel) : confirmLabel;

  return (
    <div className="modal-overlay" role="presentation">
      <div
        className={`modal-content${isTwin ? ' modal-content--twin-actions' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={questionId}
        {...(info ? { 'aria-describedby': infoId } : {})}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`modal-message-container${isTwin ? ' modal-message-container--twin' : ''}`}>
          <p id={questionId} className={`modal-question${isTwin ? ' modal-question--twin' : ''}`}>
            {question}
          </p>
          {info ? (
            <p
              id={infoId}
              className={`modal-info${isTwin ? ' modal-info--twin modal-info--preline' : ''}`}
            >
              {info}
            </p>
          ) : null}
        </div>
        {isTwin ? (
          <div className="modal-actions-twin">
            <button
              type="button"
              className="twin-action-button twin-action-button--muted"
              onClick={onTwinLeft}
              disabled={isLoading}
            >
              {twinLeftLabel}
            </button>
            <button
              type="button"
              className="twin-action-button twin-action-button--primary"
              onClick={onTwinRight}
              disabled={isLoading}
            >
              {twinRightLabel}
            </button>
          </div>
        ) : (
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose} disabled={isLoading}>
              {cancelLabel}
            </button>
            <button
              type="button"
              className="confirm-button"
              onClick={onConfirm!}
              disabled={isLoading}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmationModal;
