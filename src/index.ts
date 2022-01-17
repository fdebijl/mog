import { MongoClient, Db, Filter, Document, WithId, InsertManyResult, InsertOneResult, DeleteResult, UpdateResult, FindCursor } from 'mongodb';
import { Clog, LOGLEVEL } from '@fdebijl/clog';
import fs from 'fs';

import { Attachment, InsertOptions, MogOptions, OperationOptions, GetOptions, Operation, UpdateOptions, ListOptions } from './domain';
import { CountOptions } from './domain/type/CountOptions';

const mogVersion = JSON.parse(fs.readFileSync('package.json', 'utf-8')).version as string;

export class Mog {
  private _isKilled = false;
  private _doAutoTouch: boolean;
  private _doOperationLogging: boolean;
  private _clog: Clog;

  db: Db;
  client: MongoClient;
  collection?: string;

  constructor(options: MogOptions) {
    this.collection = options.defaultCollection;
    this._doAutoTouch = options.autoTouch === false ? false : true;
    this._doOperationLogging = options.operationLogging === true ? true : false;
    this._clog = new Clog();
    this.client = new MongoClient(options.url, {
      ...options.clientOptions,
      appName: options.appName || `Mog v${mogVersion}`,
    });

    try {
      this.db = this.client.db(options.db, options.dbOptions);
    } catch (error) {
      throw error;
    }
  }

  private _beforeEach(operation: Operation): Attachment | void {
    if (this._isKilled) {
      throw new Error('Connection to database was previously killed, new operations can no longer be performed')
    }

    if (!operation.options?.collection && !this.collection) {
      throw new Error(`Can't perform ${operation.name} operation, no collection provided as local option through the options parameter or as a global default through the constructor`)
    }

    if (this._doOperationLogging) {
      let logLine = `MOG ${operation.name.toUpperCase()} → ${operation.options?.collection ?? this.collection}`;
      logLine += operation.query ? `, Q: ${JSON.stringify(operation.query).slice(0, 15)}...` : ``
      logLine += operation.document ? `, DOC: ${JSON.stringify(operation.document).slice(0, 15)}...` : ``
      logLine += operation.options ? `, OPT: ${JSON.stringify(operation.options)}` : ``
      this._clog.log(logLine, LOGLEVEL.DEBUG);
    }

    if (this._doAutoTouch) {
      return {
        createdAt: new Date(),
        updatedAt: new Date(),
        authority: process.env.HOSTNAME
      }
    }

    return;
  }

  /**
   * Terminate the connection to the DB, resolves once the connection is closed. Any further operations will be rejected.
   * @param force Force closes the connection
  */
  kill(force = false): Promise<void> {
    this._isKilled = true;
    return this.client.close(force);
  }

  /**
   * Find the first document that matches the given query. Return type is determined by type parameter T.
   */
  get<T = WithId<Document>>(query: Filter<Document>, options: GetOptions): Promise<T | null> {
    this._beforeEach({ name: 'get', query, options});

    const collection = options.collection ?? this.collection as string;
    return this.db.collection(collection).findOne<T>(query, options);
  }

  /**
   * List all documents that match the given query. Return array type is determined by type parameter T.
   */
  list<T = WithId<Document>>(query: Filter<Document>, options: ListOptions): Promise<T[]> {
    this._beforeEach({ name: 'list', query, options });

    const collection = options.collection ?? this.collection as string;
    return this.db.collection(collection).find<T>(query).toArray();
  }

  /**
   * Return a cursor with all documents that match the given query. Return cursor type is determined by type parameter T.
   */
  cursor<T = WithId<Document>>(query: Filter<Document>, options: ListOptions): FindCursor<T> {
    this._beforeEach({ name: 'cursor', query, options });

    const collection = options.collection ?? this.collection as string;
    return this.db.collection(collection).find<T>(query);
  }

  /**
   * Insert a document, or an array of documents, into the given collection. Returns the ManyResult or OneResult of the operation.
   */
  insert<T = WithId<Document>>(document: Document | Document[], options: InsertOptions): Promise<InsertManyResult<T> | InsertOneResult<T>> {
    this._beforeEach({ name: 'insert', document, options });

    const collection = options.collection ?? this.collection as string;
    if (Array.isArray(document)) {
      return this.db.collection(collection).insertMany(document);
    } else {
      return this.db.collection(collection).insertOne(document);
    }
  }

  update(query: Filter<Document>, document: Document, options: UpdateOptions): Promise<Document | UpdateResult> {
    this._beforeEach({ name: 'update', query, document, options });

    const collection = options.collection ?? this.collection as string;
    if (Array.isArray(document)) {
      return this.db.collection(collection).updateMany(query, { $set: document }, { upsert: options.upsert });
    } else {
      return this.db.collection(collection).updateOne(query, { $set: document }, { upsert: options.upsert });
    }
  }

  delete(query: Filter<Document>, options: OperationOptions): Promise<DeleteResult> {
    this._beforeEach({ name: 'delete', query, options });

    const collection = options.collection ?? this.collection as string;
    if (Array.isArray(document)) {
      return this.db.collection(collection).deleteMany(query);
    } else {
      return this.db.collection(collection).deleteOne(query);
    }
  }

  count(query: Filter<Document>, options: CountOptions): Promise<number> {
    this._beforeEach({ name: 'count', query, options });

    const collection = options.collection ?? this.collection as string;
    if (options.fast) {
      return this.db.collection(collection).estimatedDocumentCount();
    } else {
      return this.db.collection(collection).countDocuments(query);
    }
  }
}
