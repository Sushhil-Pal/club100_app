import {
  apiGet,
  apiPost,
  clearCsrfToken,
} from "./api";

export type LoginResponse = {
  success: boolean;

  member: {
    id: string;
    fullName: string;
  };

  user: string;
};

export type RegisterResponse = {
  success: boolean;

  registrationType:
    | "ExistingMember"
    | "NewMember";

  member: {
    id: string;
    fullName: string;
  };

  user: string;
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
};

export async function login(
  mobile: string,
  password: string
): Promise<LoginResponse> {
  return apiPost<LoginResponse>(
    "/api/method/club100_core.api.auth.login",
    {
      mobile,
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