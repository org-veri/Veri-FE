export interface FullPageErrorStateAction {
  label: string;
  onClick: () => void;
}

export interface FullPageErrorStateProps {
  /** 짧은 요약 (예: 불러오기 실패) */
  title?: string;
  /** 서버 메시지·원인 설명 */
  message: string;
  primaryAction?: FullPageErrorStateAction;
  secondaryAction?: FullPageErrorStateAction;
}

/**
 * API/네트워크 실패 등 전체 화면 오류 UI.
 * `layout.css`의 `.page-container.error-state`와 동일한 레이아웃·타이포를 쓰도록 맞춤.
 */
export function FullPageErrorState({
  title = '문제가 발생했습니다',
  message,
  primaryAction,
  secondaryAction,
}: FullPageErrorStateProps) {
  return (
    <div className="page-container error-state">
      <p className="page-error-state__title">{title}</p>
      <p className="page-error-state__message">{message}</p>
      {(primaryAction || secondaryAction) && (
        <div className="page-error-state__actions">
          {primaryAction && (
            <button type="button" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button type="button" className="page-error-state__btn-secondary" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
