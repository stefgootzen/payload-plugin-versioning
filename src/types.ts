export interface PluginTypes {
  /**
   * Enable or disable plugin
   * @default false
   */
  enabled?: boolean
  relations: Relation[]
}

export type Relation = {
  baseSlug: string
  versionSlug: string
}

export interface NewCollectionTypes {
  title: string
}
