export interface PluginTypes {
  /**
   * Enable or disable plugin
   * @default false
   */
  enabled?: boolean
  relations: Relation[]
}

export type Document = {
  id: string
}

export type Relation = {
  baseSlug: string
  versionSlug: string
}

export interface BaseDocument extends Document {
  title: string
  versions: (string | VersionDocument)[]
}

export interface VersionDocument extends Document {
  versionNumber: string
  base: string | BaseDocument
}
