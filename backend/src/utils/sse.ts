import * as uuid from "uuid";

import { Response } from "express";
import { EventEmitter } from "events";

interface QueueItem {
  event: string;
  payload: any;
  userIds?: number[];
}

interface SSEClient {
  id: string;
  userId: number;
  response: Response;
}

const emitter = new EventEmitter();

let processingQueue = false;
const queue: QueueItem[] = [];

let clients: SSEClient[] = [];

emitter.on("entry", async (entry) => {
  queue.push(entry);

  if (processingQueue) {
    return;
  }

  processingQueue = true;

  while (queue.length > 0) {
    const item = queue.shift()!;
    await sendSSE(item.event, item.payload, item.userIds);
  }

  processingQueue = false;
});

const sendSSE = async (event: string, payload: any, userIds?: number[]) => {
  const data = JSON.stringify(payload);

  clients.forEach((client) => {
    // If userIds is specified, ensure the client userId is in the list
    if (!userIds || userIds.includes(client.userId)) sendSSEMessage(client, event, data);
  });
};

export const sendEvent = (event: string, payload: any, userIds?: number[]) => {
  emitter.emit("entry", {
    event,
    payload: payload ?? {},
    userIds: userIds,
  });
};

export const addSSEClient = (res: Response, userId: number) => {
  const client = {
    id: uuid.v4(),
    userId: userId,
    response: res,
  };

  clients.push(client);
  return client;
};

export const removeSSEClient = (client: SSEClient) => {
  const newClients = clients.filter((c) => c.id !== client.id);
  clients = newClients;
};

export const sendSSEMessage = (client: SSEClient, event: string, payload: string) => {
  const data = JSON.stringify({
    name: event,
    payload: payload,
  });

  client.response.write(`data: ${data}\n\n`);
};
