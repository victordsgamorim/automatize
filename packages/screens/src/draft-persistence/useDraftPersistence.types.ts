export interface UseDraftPersistenceOptions {
  /** Unique key for sessionStorage, e.g. 'automatize:client-form-draft' */
  storageKey: string;
}

export interface UseDraftPersistenceResult<T> {
  /** Restored draft data, or undefined if none exists (or on page reload) */
  initialData: T | undefined;
  /** Persist current form data to sessionStorage */
  save: (data: T) => void;
  /** Remove draft from sessionStorage */
  clear: () => void;
}
