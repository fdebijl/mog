export interface Attachment {
  /** Date/time for when this document was first created */
  createdAt?: Date;
  /** Date/time for when this document was last modified */
  updatedAt?: Date;
  /** Hostname of the machine that performed the operation */
  authority?: string;
}