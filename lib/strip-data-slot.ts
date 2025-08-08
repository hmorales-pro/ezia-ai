export function stripDataSlot<T extends Record<string, any>>(props: T): T {
  // Always strip data-slot in production builds
  if ('data-slot' in props) {
    const { 'data-slot': _, ...rest } = props;
    return rest as T;
  }
  return props;
}