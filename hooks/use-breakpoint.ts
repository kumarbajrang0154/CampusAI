import { useMediaQuery } from './use-media-query';

export type Breakpoint = 'mobile' | 'tablet' | 'laptop' | 'desktop';

export function useBreakpoint(): Breakpoint {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
  const isLaptop = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)');
  
  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  if (isLaptop) return 'laptop';
  return 'desktop';
}
