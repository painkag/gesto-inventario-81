import { useState, useCallback } from 'react';

export const useDocumentMask = () => {
  const [value, setValue] = useState('');

  const formatDocument = useCallback((input: string) => {
    // Remove tudo que não é dígito
    const numbers = input.replace(/\D/g, '');
    
    if (numbers.length <= 11) {
      // CPF: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }
  }, []);

  const handleChange = useCallback((newValue: string) => {
    const formatted = formatDocument(newValue);
    setValue(formatted);
    return formatted;
  }, [formatDocument]);

  const reset = useCallback(() => {
    setValue('');
  }, []);

  const getUnmaskedValue = useCallback(() => {
    return value.replace(/\D/g, '');
  }, [value]);

  return {
    value,
    setValue,
    handleChange,
    formatDocument,
    reset,
    getUnmaskedValue,
  };
};