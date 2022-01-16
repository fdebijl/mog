import { Document } from "mongodb";
import { OperationOptions } from ".";

export type Operation = {
  name: string;
  query?: object;
  document?: Document;
  options?: OperationOptions;
}
