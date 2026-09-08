type Method = "GET" | "POST" | "PUT" | "DELETE";

type Reindex = {
  model: string;
  id: number;
};

type AllowedAttributes = {
  flat_page?: {
    title: string;
  };
  map_overlay?: {
    south: number;
    east: number;
    north: number;
    west: number;
  };
  tour?: {
    title?: string;
    blank_map?: boolean;
    mode_id?: number;
  };
  stop?: {
    title?: string;
    map_icon?: string | null;
    lat?: number;
    lng?: number;
    address?: string;
  };
  tour_flat_page?: {
    flat_page_id: number;
    tour_id: number;
    position: number;
  };
  tour_stop?: {
    stop_id: number;
    tour_id: number;
    position: number;
  };
  tour_mode?: {
    tour_id: number;
    mode_id: number;
  };
  tour_set?: {
    logo?: null;
    name?: string | undefined;
    description?: string;
  };
  user?:
    | {
        terms_accepted?: boolean;
      }
    | number;
  access_request?: {
    user?: number;
    tour_ids?: number[] | string[] | null;
    approved?: boolean;
  };
  tour_set_admin?: {
    user_id: number;
    tour_set_id: number;
  };
};

export type UpdateBody = AllowedAttributes & {
  attribute?: string;
  model: string;
  value?: string | number | boolean | null;
  related_model?: string;
  related_type?: "belongs_to" | "many" | undefined;
  reindex?: Reindex;
  logo?: null;
  tour_ids?: FormDataEntryValue[];
  tour_id?: number | string;
  user_id?: number | string;
  username?: string;
};

type CreateBody = AllowedAttributes & {
  model: string;
  attributes?:
    | {
        tour_id?: number;
        stop_id?: number;
        flat_page_id?: number;
        medium_id?: number;
        file?: File;
        title?: string;
        name?: string;
      }
    | FormData;
  reindex?: Reindex;
};

type UpdateOptions = {
  body: UpdateBody;
  record: string | number;
  tenant: string;
  path?: string;
};

type FetchOptions = {
  path: string;
  method?: Method;
  requestHeaders?: HeadersInit;
  credentials?: "include" | "omit" | "same-origin";
  body?: UpdateBody | CreateBody | FormData;
};
export const request = async ({
  path,
  method,
  requestHeaders = {},
  credentials = "include",
  body,
}: FetchOptions) => {
  try {
    const response: Response = await fetch(
      `https://api.opentour.site/${path}`,
      {
        referrerPolicy: "strict-origin-when-cross-origin",
        body: body ? JSON.stringify(body) : null,
        method: method ?? "GET",
        mode: "cors",
        credentials,
        headers: {
          "Content-Type": "application/json",
          ...requestHeaders,
        },
      },
    );

    const { status, headers } = response;

    if ((response.ok && method === "DELETE") || response.status === 204) {
      return { response, data: {}, status, headers };
    }

    // Some responses (e.g. head(:not_found)/head(:unauthorized) on the
    // Rails side) have no body at all despite not being a 204. Parsing
    // those as JSON throws — fall back to {} but keep the real response,
    // so callers can still inspect response.status/response.ok correctly
    // instead of losing them to the catch block below.
    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }
    return { response, data, status, headers };
  } catch (error) {
    // A network-level failure (offline, CORS, DNS, etc.) never got a real
    // Response — status: 0 is the conventional sentinel for that, and lets
    // callers safely check response.status without a separate type branch.
    return { response: { ok: false, status: 0, error }, data: undefined };
  }
};

export const fetchCurrentUser = async () => {
  const { data } = await request({ path: "public/v4/admin/users/me" });
  if (data.id) return data;
  return undefined;
};

export const verifyToken = async (token: string) => {
  const { response, data } = await request({
    path: `auth/verify`,
    requestHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    return await fetchCurrentUser();
  }

  return data;
};

export const signOut = async () => {
  return await request({ path: "auth/tokens", method: "DELETE" });
};

export const sendCreate = async ({
  tenant,
  body,
  path,
}: {
  tenant: string;
  body: CreateBody;
  path?: string;
}) => {
  return await request({
    path: path ?? `${tenant}/v4/admin/crud`,
    body,
    method: "POST",
  });
};

export const sendUpdate = async ({
  tenant,
  record,
  body,
  path,
}: UpdateOptions) => {
  return await request({
    path: path ?? `${tenant}/v4/admin/crud/${record}`,
    body,
    method: "PUT",
  });
};

export const sendUpload = async ({
  tenant,
  body,
}: {
  tenant: string;
  body: FormData;
}) => {
  const response = await fetch(
    `https://api.opentour.site/${tenant}/v4/admin/crud`,
    {
      body,
      method: "POST",
      credentials: "include",
    },
  );

  const data = await response.json();

  return { response, data };
};

export const sendUpdateUpload = async ({
  tenant,
  body,
  recordId,
}: {
  tenant: string;
  body: FormData;
  recordId: number;
}) => {
  const response = await fetch(
    `https://api.opentour.site/${tenant}/v4/admin/crud/${recordId}`,
    {
      body,
      method: "PUT",
      credentials: "include",
    },
  );

  const data = await response.json();

  return { response, data };
};

export const sendDelete = async ({
  tenant,
  record,
  body,
}: {
  tenant: string;
  record: number;
  body: UpdateBody;
}) => {
  return await request({
    path: `${tenant}/v4/admin/crud/${record}`,
    method: "DELETE",
    body,
  });
};
