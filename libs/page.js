import { client } from "./client";

export async function getAllPages(limit = 100) {
  const response = await client.get({
    endpoint: "pages",
    queries: { limit: limit },
  });
  return response.contents;
}

export async function getPageById(id) {
  const response = await client.get({
    endpoint: "pages",
    contentId: id,
  });
  return response;
}