const isObject = (value: unknown): value is Record<string, any> =>
  typeof value === 'object' && value !== null;

export default isObject;
