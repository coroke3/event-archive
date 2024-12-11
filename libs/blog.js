import { client } from "./client";

export async function getAllBlogs(limit = 100) {
  const response = await client.get({
    endpoint: "blogs",
    queries: { limit: limit },
  });
  return response.contents;
}

export async function getBlogById(id) {
  const response = await client.get({
    endpoint: "blogs",
    contentId: id,
  });
  return response;
}