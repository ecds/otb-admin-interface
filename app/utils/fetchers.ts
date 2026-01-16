type Method = "GET" | "POST" | "PUT" | "DELETE";

type UpdateBody = {
  attribute: string;
  model: string;
  value: string | number | boolean;
  related_model?: string;
  related_type?: "belongs_to" | "many";
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
  body?: UpdateBody;
};
export const fetchData = async ({
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
      headers,
    });

    if (method === "DELETE") {
      return { response, data: {} };
    }

    const data = response.ok ? await response.json() : {};
    return { response, data };
  } catch (error) {
    return { response: { ok: false }, data: {}, error };
  }
};

export const fetchCurrentUser = async () => {
  const { data } = await fetchData({ path: "public/users?me=true" });
  return data.data;
};

export const verifyToken = async (token: string) => {
  const { response, data } = await fetchData({
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
  return await fetchData({ path: "auth/tokens", method: "DELETE" });
};

export const sendUpdate = async ({ tenant, record, body }: UpdateOptions) => {
  return await fetchData({
    path: `${tenant}/v4/admin/crud/${record}`,
    body,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });
};
