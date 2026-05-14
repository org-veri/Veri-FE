export interface SectionErrorBannerProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/** 페이지 일부(섹션)에서 쓰는 오류 안내 — FullPageErrorState와 동일한 타이포 톤 */
export function SectionErrorBanner({
  message,
  onRetry,
  retryLabel = '다시 시도',
}: SectionErrorBannerProps) {
  return (
    <div className="section-error-banner" role="alert">
      <p className="section-error-banner__message">{message}</p>
      {onRetry && (
        <button type="button" className="section-error-banner__retry" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  );
}
