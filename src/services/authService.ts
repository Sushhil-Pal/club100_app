import {
  apiGet,
  apiPost,
  clearCsrfToken,
} from "./api";

export type AppRole =
  | "member"
  | "trainer";

export type AuthMember = {
  id: string;
  fullName: string;
  onboardingStatus: string;
};

export type AuthTrainer = {
  id: string;
  trainerName: string;
  trainerType: string | null;
};

export type AppUserContext = {
  user: string;
  roles: AppRole[];
  member: AuthMember | null;
  trainer: AuthTrainer | null;
};

export type LoginResponse =
  AppUserContext & {
    success: boolean;
  };

export type RegisterResponse =
  AppUserContext & {
    success: boolean;

    registrationType:
      | "ExistingMember"
      | "NewMember";
  };

export type RegisterInput = {
  fullName: string;
  mobile: string;
  email?: string;
  password: string;
};

export type SessionStatus = {
  authenticated: boolean;
  user: string | null;
  roles: AppRole[];
  member: AuthMember | null;
  trainer: AuthTrainer | null;
};

export async function login(
  loginId: string,
  password: string
): Promise<LoginResponse> {
  return apiPost<LoginResponse>(
    "/api/method/club100_core.api.auth.login",
    {
      // New generic login identifier.
      login_id: loginId,

      // Keep this temporarily for backwards
      // compatibility with member mobile login.
      mobile: loginId,

      password,
    }
  );
}

export async function register(
  input: RegisterInput
): Promise<RegisterResponse> {
  return apiPost<RegisterResponse>(
    "/api/method/club100_core.api.auth.register",
    {
      full_name: input.fullName,
      mobile: input.mobile,
      email: input.email ?? "",
      password: input.password,
    }
  );
}

export async function logout(): Promise<{
  success: boolean;
}> {
  const result = await apiPost<{
    success: boolean;
  }>(
    "/api/method/club100_core.api.auth.logout"
  );

  clearCsrfToken();

  return result;
}

export async function getSessionStatus(): Promise<SessionStatus> {
  return apiGet<SessionStatus>(
    "/api/method/club100_core.api.auth.session_status"
  );
}

export type PasswordResetRequestResponse = {
  success: boolean;
  message: string;
};

export type ResetPasswordResponse = {
  success: boolean;
  message: string;
};

export async function requestPasswordReset(
  mobile: string
): Promise<PasswordResetRequestResponse> {
  return apiPost<PasswordResetRequestResponse>(
    "/api/method/club100_core.api.auth.request_password_reset",
    {
      mobile,
    }
  );
}

export async function resetPassword(
  token: string,
  password: string
): Promise<ResetPasswordResponse> {
  return apiPost<ResetPasswordResponse>(
    "/api/method/club100_core.api.auth.reset_password",
    {
      token,
      password,
    }
  );
}