import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import backendApi from '../server/eden-treaty'
import { queryKeys } from './query-keys'

type AdminLogsQuery = Readonly<{
  action?: string
  adminId?: string
  from?: string
  targetUserId?: string
  to?: string
}>

type AdminLogsPostArg = Parameters<(typeof backendApi.api)['admin-logs']['post']>[0]

export function useAdminLogsQuery(filters: AdminLogsQuery = {}) {
  return useQuery({
    queryFn: async () => {
      const { data } = await backendApi.api['admin-logs'].get({ query: filters })
      return data
    },
    queryKey: queryKeys.adminLogs(filters),
  })
}

export function useAdminLogQuery(id: number, enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const { data } = await backendApi.api['admin-logs']({ id }).get()
      return data
    },
    queryKey: queryKeys.adminLog(id),
  })
}

export function useCreateAdminLogMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (arg: AdminLogsPostArg) => backendApi.api['admin-logs'].post(arg),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminLogs() })
    },
  })
}
