import { client } from "./client";

export async function getAllWorks(limit = 100) {
  const response = await client.get({
    endpoint: "works",
    queries: { limit: limit },
  });
  return response.contents;
}

export async function getWorkById(id) {
  const response = await client.get({
    endpoint: "works",
    contentId: id,
  });
  return response;
}