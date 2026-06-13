import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", function (err) {
  throw err;
});

export default async function initRedis() {
  await client.connect();
  return client;
}
