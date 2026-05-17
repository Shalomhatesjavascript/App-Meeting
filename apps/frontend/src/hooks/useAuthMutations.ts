import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authClient } from '../lib/auth-client'
import { QueryKeyEnum } from './query-keys'
import type { ExtractFirstFunctionParamter } from '../shared/util'

export function useRegisterUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (arg: ExtractFirstFunctionParamter<typeof authClient.signUp.email>) =>
      authClient.signUp.email(arg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.User] })
    },
  })
}

type VerifyCodeArg = Omit<
  ExtractFirstFunctionParamter<typeof authClient.emailOtp.sendVerificationOtp>,
  'type'
>

export function useSendSignInCodeMutation() {
  return useMutation({
    mutationFn: (arg: VerifyCodeArg) =>
      authClient.emailOtp.sendVerificationOtp({ ...arg, type: 'sign-in' }),
  })
}

export function useResendVerificationCodeMutation() {
  return useMutation({
    mutationFn: (arg: VerifyCodeArg) =>
      authClient.emailOtp.sendVerificationOtp({ ...arg, type: 'email-verification' }),
  })
}

export function useVerifySignInCodeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (arg: { email: string; otp: string }) => authClient.signIn.emailOtp(arg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.User] })
    },
  })
}

export function useVerifyEmailCodeMutation() {
  return useMutation({
    mutationFn: (arg: { email: string; otp: string }) => authClient.emailOtp.verifyEmail(arg),
  })
}

export function useLogoutUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      queryClient.clear()
    },
  })
}
