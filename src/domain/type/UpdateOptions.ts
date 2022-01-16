import { OperationOptions } from "./OperationOptions";

export type UpdateOptions = OperationOptions & {
  upsert?: boolean;
}