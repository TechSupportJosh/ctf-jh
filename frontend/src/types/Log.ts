export interface Log {
  id: number;
  createdAt: string;
  eventType: string;
  data: Record<string, any>;
}
