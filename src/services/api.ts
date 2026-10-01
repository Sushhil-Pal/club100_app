let csrfToken: string | null = null;

type FrappeErrorPayload = {
  message?: unknown;
  exception?: unknown;
  exc_type?: unknown;
  _server_messages?: unknown;
  server_messages?: unknown;
};

function parseServerMessages(
  raw: unknown
): string[] {
  if (!raw) {
    return [];
  }

  try {
    const outer =
      typeof raw === "string"
        ? JSON.parse(raw)
        : raw;

    if (!Array.isArray(outer)) {
      return [];
    }

    const messages: string[] = [];

    for (const item of outer) {
      try {
        const parsed =
          typeof item === "string"
            ? JSON.parse(item)
            : item;

        if (
          parsed &&
          typeof parsed === "object" &&
          "message" in parsed &&
          typeof parsed.message === "string"
        ) {
          messages.push(
            parsed.message
          );
        } else if (
          typeof parsed === "string"
        ) {
          messages.push(parsed);
        }
      } catch {
        if (typeof item === "string") {
          messages.push(item);
        }
      }
    }

    return messages;
  } catch {
    return [];
  }
}

function getApiErrorMessage(
  data: FrappeErrorPayload | null,
  status: number
): string {
  if (!data) {
    return `API request failed: ${status}`;
  }

  const serverMessages = [
    ...parseServerMessages(
      data._server_messages
    ),
    ...parseServerMessages(
      data.server_messages
    ),
  ];

  if (serverMessages.length > 0) {
    return serverMessages.join("\n");
  }

  if (
    typeof data.message === "string" &&
    data.message.trim()
  ) {
    return data.message;
  }

  if (
    typeof data.exception === "string" &&
    data.exception.trim()
  ) {
    // Avoid showing only something like:
    // frappe.exceptions.ValidationError
    if (
      !data.exception.startsWith(
        "frappe.exceptions."
      )
    ) {
      return data.exception;
    }
  }

  if (
    typeof data.exc_type === "string" &&
    data.exc_type.trim()
  ) {
    return data.exc_type;
  }

  return `API request failed: ${status}`;
}

async function throwApiError(
  response: Response
): Promise<never> {
  const data =
    (await response
      .json()
      .catch(() => null)) as
      | FrappeErrorPayload
      | null;

  throw new Error(
    getApiErrorMessage(
      data,
      response.status
    )
  );
}

export async function apiGet<T>(
  path: string
): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
  });

  if (!response.ok) {
    await throwApiError(response);
  }

  const data = await response.json();

  return (
    Object.prototype.hasOwnProperty.call(
      data,
      "message"
    )
      ? data.message
      : null
  ) as T;
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
  const token =
    await getCsrfToken();

  const response = await fetch(path, {
    method: "POST",

    credentials: "include",

    headers: {
      "Content-Type":
        "application/json",

      "X-Frappe-CSRF-Token":
        token,
    },

    body: JSON.stringify(
      body ?? {}
    ),
  });

  if (!response.ok) {
    await throwApiError(response);
  }

  const data = await response.json();

  return (
    Object.prototype.hasOwnProperty.call(
      data,
      "message"
    )
      ? data.message
      : null
  ) as T;
}