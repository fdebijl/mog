import { DbOptions, MongoClientOptions } from 'mongodb';

export type MogOptions = {
  url: string;
  db: string;
  appName?: string;
  /** Default collection that is used for all operations. If not set, a collection must be passed with every operation */
  defaultCollection?: string;
  /** Automatically add createdAt and updatedAt timestamps everytime a document is created or updated. Defaults to true */
  autoTouch?: boolean;
  /** Log all operations performed by Mog at the DEBUG loglevel. If you need even more granular logging, set loggerLevel on clientOptions to 'debug'. Defaults to false  */
  operationLogging?: boolean;
  /** Options that are passed through to the DB constructor */
  dbOptions?: DbOptions;
  /** Options that are passed through to the Mongo Client constructor */
  clientOptions?: MongoClientOptions;
}
