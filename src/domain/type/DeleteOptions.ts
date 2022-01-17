import { OperationOptions } from "./OperationOptions";

export type DeleteOptions = OperationOptions & {
  /** Allow deletion of more than one document if true */
  many?: boolean;
}
