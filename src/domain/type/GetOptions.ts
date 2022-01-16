import { FindOptions } from "mongodb";
import { OperationOptions } from "./OperationOptions";

export type GetOptions = OperationOptions & FindOptions;