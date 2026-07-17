import { useSidebarStore } from '@/store';

export function useSidebar() {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const toggle = useSidebarStore((state) => state.toggle);
  const setCollapsed = useSidebarStore((state) => state.setCollapsed);

  return {
    isCollapsed,
    toggle,
    setCollapsed,
  };
}
