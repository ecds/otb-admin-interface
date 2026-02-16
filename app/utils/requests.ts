type Method = "GET" | "POST" | "PUT" | "DELETE";

type Reindex = {
  model: string;
  id: number;
};

export type UpdateBody = {
  attribute?: string;
  model: string;
  value?: string | number | boolean | null;
  related_model?: string;
  related_type?: "belongs_to" | "many" | undefined;
  reindex?: Reindex;
};

type CreateBody = {
  model: string;
  attributes?:
    | {
        tour_id?: number;
        stop_id?: number;
        flat_page_id?: number;
        medium_id?: number;
        file?: File;
        title?: string;
      }
    | FormData;
  flat_page?: {
    title: string;
  };
  tour?: {
    title: string;
  };
  stop?: {
    title: string;
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
  reindex?: Reindex;
};

type UpdateOptions = {
  body: UpdateBody;
  record: string | number;
  tenant: string;
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

    if (response.ok && method === "DELETE") {
      return { response, data: {}, status, headers };
    }

    const data = await response.json();
    return { response, data, status, headers };
  } catch (error) {
    return { response: { ok: false, error } };
  }
};

export const fetchCurrentUser = async () => {
  const { data } = await request({ path: "public/v4/admin/users?me=true" });
  return data;
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
}: {
  tenant: string;
  body: CreateBody;
}) => {
  return await request({
    path: `${tenant}/v4/admin/crud`,
    body,
    method: "POST",
  });
};

export const sendUpdate = async ({ tenant, record, body }: UpdateOptions) => {
  return await request({
    path: `${tenant}/v4/admin/crud/${record}`,
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
