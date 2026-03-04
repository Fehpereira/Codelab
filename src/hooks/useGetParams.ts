import { useParams } from 'next/navigation';

type RouteParamValue = string | string[] | undefined;

export function useGetParams<K extends string>(key: K): string;
export function useGetParams<
  K1 extends string,
  K2 extends string,
  KR extends string[],
>(key1: K1, key2: K2, ...rest: KR): Record<K1 | K2 | KR[number], string>;
export function useGetParams(...keys: string[]) {
  const params = useParams<Record<string, RouteParamValue>>();

  const getParam = (key: string) => {
    const value = params[key];

    if (typeof value !== 'string') {
      throw new Error(`Expected route param "${key}" to be a string.`);
    }

    return value;
  };

  if (keys.length === 1) {
    return getParam(keys[0]);
  }

  const dynamicParams = {} as Record<string, string>;

  for (const key of keys) {
    dynamicParams[key] = getParam(key);
  }

  return dynamicParams;
}
