let csrfToken: string | null = null;

export async function apiGet<T>(
  path: string
): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status}`
    );
  }

  const data = await response.json();

  return data.message as T;
}


async function getCsrfToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }

  const result = await apiGet<{
    csrfToken: string;
  }>(
    "/api/method/club100_core.api.auth.csrf_token"
  );

  csrfToken = result.csrfToken;

  return csrfToken;
}


export function clearCsrfToken() {
  csrfToken = null;
}


export async function apiPost<T>(
  path: string,
  body?: unknown
): Promise<T> {
  const token = await getCsrfToken();

  const response = await fetch(path, {
    method: "POST",

    credentials: "include",

    headers: {
      "Content-Type": "application/json",
      "X-Frappe-CSRF-Token": token,
    },

    body: JSON.stringify(body ?? {}),
  });

  if (!response.ok) {
    const data = await response
      .json()
      .catch(() => null);

    throw new Error(
      data?.exception ||
        data?.message ||
        `API request failed: ${response.status}`
    );
  }

  const data = await response.json();

  return (
    Object.prototype.hasOwnProperty.call(data, "message")
        ? data.message
        : null
    ) as T;
}