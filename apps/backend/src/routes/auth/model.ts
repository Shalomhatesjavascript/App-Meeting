import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyInput,
} from '@repo/shared'

/**
 * Auth model functions.
 * These are stubs to be implemented with actual DB and business logic.
 */
export const AuthModel = {
  async register(_data: RegisterInput) {
    // TODO: Implement registration logic (hash password, create user, send verification, etc.)
    return { success: true, userId: 1 }
  },

  async login(_data: LoginInput) {
    // TODO: Implement login logic (verify password, return token/session, etc.)
    return { success: true, token: 'jwt-token' }
  },

  async verify(_data: VerifyInput) {
    // TODO: Implement email verification logic
    return { success: true }
  },

  async forgotPassword(_data: ForgotPasswordInput) {
    // TODO: Implement forgot password logic (send reset email/code)
    return { success: true }
  },

  async resetPassword(_data: ResetPasswordInput) {
    // TODO: Implement reset password logic (validate code, update password)
    return { success: true }
  },
}
