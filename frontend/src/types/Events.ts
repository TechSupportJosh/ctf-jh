type FetchType = "user" | "config" | "challenges";

export interface ServerEvent {
  name: string;
  payload: string;
}
