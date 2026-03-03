import { useParams } from 'next/navigation';

export function useGetParams(param: string) {
  const params = useParams();

  const dynamicParam = params[param] as string;

  return dynamicParam;
}
