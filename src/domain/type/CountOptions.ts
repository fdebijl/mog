import { OperationOptions } from "./OperationOptions";

export type CountOptions = OperationOptions & {
  /** Runs a much faster but inexact count that ignores the query, instead of a full count */
  fast?: number;
}
