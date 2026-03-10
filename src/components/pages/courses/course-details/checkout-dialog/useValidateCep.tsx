import { unMockValue } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { UseFormSetError } from 'react-hook-form';

export function useValidateCep(
  rawCep: string,
  setError: UseFormSetError<{
    cpf: string;
    name: string;
    postalCode: string;
    addressNumber: string;
  }>,
) {
  return useMutation({
    mutationFn: async () => {
      try {
        const cep = unMockValue(rawCep);

        const response = await axios.get(
          `https://viacep.com.br/ws/${cep}/json`,
        );

        if (response.data.erro) {
          setError('postalCode', { type: 'manual', message: 'CEP inválido' });
          return false;
        }

        return true;
      } catch (error) {
        setError('postalCode', {
          type: 'manual',
          message: 'Erro ao validar o CEP',
        });
      }
    },
  });
}
