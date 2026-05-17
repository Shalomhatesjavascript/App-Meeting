import { useQuery } from '@tanstack/react-query'
import { getInterestsCatalog } from '../shared/catalog'
import { queryKeys } from './query-keys'

export function useInterestsCatalogQuery() {
  return useQuery({
    queryFn: getInterestsCatalog,
    queryKey: queryKeys.interestsCatalog(),
  })
}
