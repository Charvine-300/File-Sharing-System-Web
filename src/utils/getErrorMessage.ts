import { AxiosError } from "axios";

interface ApiErrorBody {
  message?: string;
}

async function extractMessage(data: unknown): Promise<string | undefined> {
  // Requests made with responseType: "blob" (file downloads) get Blob bodies
  // for error responses too, not just successful ones — the JSON error body
  // has to be read back out of the blob before `.message` means anything.
  if (data instanceof Blob) {
    try {
      const text = await data.text();
      return (JSON.parse(text) as ApiErrorBody).message;
    } catch {
      return undefined;
    }
  }

  return (data as ApiErrorBody | undefined)?.message;
}

export async function getErrorMessage(err: unknown): Promise<string> {
  if (err instanceof AxiosError) {
    const message = await extractMessage(err.response?.data);
    return message ?? "An error occurred";
  }
  return "An error occurred";
}
