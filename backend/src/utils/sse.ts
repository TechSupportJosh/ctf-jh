import * as uuid from "uuid";

import { Response } from "express";
import { EventEmitter } from "events";

interface QueueItem {
  event: string;
  payload: any;
}

interface SSEClient {
  id: string;
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
    await sendSSE(item.event, item.payload);
  }

  processingQueue = false;
});

const sendSSE = async (event: string, payload: any) => {
  const data = JSON.stringify(payload);

  clients.forEach((client) => {
    sendSSEMessage(client, event, data);
  });
};

export const sendEvent = (event: string, payload: any) => {
  emitter.emit("entry", {
    event,
    payload: payload ?? {},
  });
};

export const addSSEClient = (res: Response) => {
  const client = {
    id: uuid.v4(),
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
