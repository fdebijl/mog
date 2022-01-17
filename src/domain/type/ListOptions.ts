import { FindOptions } from "mongodb";
import { OperationOptions } from "./OperationOptions";

export type ListOptions = OperationOptions & FindOptions;
