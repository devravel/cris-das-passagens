export const ARTICLE_CONTENT_SELECTOR = "[data-article-content]";

/** Progresso mínimo para exibir a sidebar de leitura (10%). */
export const READING_SIDEBAR_SHOW_AT = 0.1;

/** Progresso em que a sidebar de leitura some (95%). */
export const READING_SIDEBAR_HIDE_AT = 0.95;

export function clampReadingProgress(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function measureArticleReadingProgress(content: HTMLElement): number {
  const rect = content.getBoundingClientRect();
  const scrollable = rect.height - window.innerHeight;

  if (scrollable <= 0) {
    return rect.top <= 0 ? 1 : 0;
  }

  return clampReadingProgress(-rect.top / scrollable);
}

export function isReadingSidebarVisible(progress: number): boolean {
  return progress >= READING_SIDEBAR_SHOW_AT && progress < READING_SIDEBAR_HIDE_AT;
}
