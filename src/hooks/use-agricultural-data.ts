import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useMarketPrices = () => {
  return useQuery({
    queryKey: ['market-prices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCrops = () => {
  return useQuery({
    queryKey: ['crops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crops')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });
};

export const usePests = (crop?: string) => {
  return useQuery({
    queryKey: ['pests', crop],
    queryFn: async () => {
      let query = supabase.from('pests').select('*');
      if (crop) {
        query = query.eq('crop', crop);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useDiseases = (crop?: string) => {
  return useQuery({
    queryKey: ['diseases', crop],
    queryFn: async () => {
      let query = supabase.from('diseases').select('*');
      if (crop) {
        query = query.eq('crop', crop);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};
