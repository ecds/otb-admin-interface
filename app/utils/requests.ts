type Method = "GET" | "POST" | "PUT" | "DELETE";

export type UpdateBody = {
  attribute?: string;
  model: string;
  value?: string | number | boolean | null;
  related_model?: string;
  related_type?: "belongs_to" | "many" | undefined;
  reindex?: {
    model: string;
    id: number;
  };
};

type CreateBody = {
  model: string;
  attributes?:
    | {
        tour_id?: number;
        stop_id?: number;
        medium_id?: number;
        file?: File;
      }
    | FormData;
};

type UpdateOptions = {
  body: UpdateBody;
  record: string | number;
  tenant: string;
};

type FetchOptions = {
  path: string;
  method?: Method;
  headers?: HeadersInit;
  credentials?: "include" | "omit" | "same-origin";
  body?: UpdateBody | CreateBody | FormData;
};
export const request = async ({
  path,
  method,
  headers = {},
  credentials = "include",
  body,
}: FetchOptions) => {
  try {
    const response = await fetch(`https://api.opentour.site/${path}`, {
      referrerPolicy: "strict-origin-when-cross-origin",
      body: body ? JSON.stringify(body) : null,
      method: method ?? "GET",
      mode: "cors",
      credentials,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    if (method === "DELETE") {
      return { response, data: {} };
    }

    const data = response.ok ? await response.json() : {};
    return { response, data };
  } catch (error) {
    return { response: { ok: false }, id: 0, data: {}, error };
  }
};

export const fetchCurrentUser = async () => {
  const { data } = await request({ path: "public/users?me=true" });
  return data.data;
};

export const verifyToken = async (token: string) => {
  const { response, data } = await request({
    path: `auth/verify`,
    headers: {
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
