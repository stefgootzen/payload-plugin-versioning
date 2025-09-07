import type { Config, CollectionConfig } from 'payload'

import type { PluginTypes, Relation } from './types.js'
import {
  createAddVersionToBase,
  createRemoveVersionFromBase,
  createSetVersionNumber,
} from './hooks/version/index.js'
import {
  buildCreateVersionIfPassedOnBaseCreate,
  buildDeleteCorrespondingVersions,
} from './hooks/base/index.js'

const modifyBaseDocumentConfig = (
  collection: CollectionConfig,
  collectionPair: Relation,
): CollectionConfig => {
  collection.fields = [
    ...collection.fields,
    {
      name: 'versions',
      type: 'relationship',
      relationTo: collectionPair.versionSlug,
      hasMany: true,
      required: false,
    },
  ]

  collection.hooks = {
    ...collection.hooks,
    afterChange: [
      buildCreateVersionIfPassedOnBaseCreate(collectionPair),
      ...(collection.hooks?.afterChange || []),
    ],
    afterDelete: [
      buildDeleteCorrespondingVersions(collectionPair),
      ...(collection.hooks?.afterDelete || []),
    ],
  }

  return collection
}

const modifyVersionsCollectionConfig = (
  collection: CollectionConfig,
  collectionPair: Relation,
): CollectionConfig => {
  collection.fields = [
    ...collection.fields,
    {
      name: 'base',
      type: 'relationship',
      relationTo: collectionPair.baseSlug,
      hasMany: false,
      required: true,
    },
    {
      name: 'versionNumber',
      type: 'number',
      required: false, // todo; try required true and set version to 1
    },
  ]

  collection.hooks = {
    ...collection.hooks,
    beforeChange: [
      createSetVersionNumber(collectionPair),
      ...(collection.hooks?.beforeChange || []),
    ],
    afterChange: [createAddVersionToBase(collectionPair), ...(collection.hooks?.afterChange || [])],
    afterDelete: [
      createRemoveVersionFromBase(collectionPair),
      ...(collection.hooks?.afterDelete || []),
    ],
  }

  return collection
}

type PairResult = {
  type: 'base' | 'version'
  relation: Relation
}

const getCollectionPairForCollectionConfig = (
  relationItems: Relation[],
  config: CollectionConfig,
): PairResult | null => {
  const baseSlugs = relationItems.map((pair) => pair.baseSlug)
  const versionSlugs = relationItems.map((pair) => pair.versionSlug)

  if (baseSlugs.includes(config.slug)) {
    return {
      type: 'base',
      relation: relationItems.find((pair) => pair.baseSlug === config.slug)!,
    }
  }

  if (versionSlugs.includes(config.slug)) {
    return {
      type: 'version',
      relation: relationItems.find((pair) => pair.versionSlug === config.slug)!,
    }
  }

  return null
}

export const withVersioning =
  (pluginOptions: PluginTypes) =>
  (config: Config): Config => {
    if (!config.collections) {
      config.collections = []
    }

    // config.collections.push({
    //   slug: 'plugin-collection',
    //   fields: [
    //     {
    //       name: 'id',
    //       type: 'text',
    //     },
    //   ],
    // })
    //

    config.collections = (config.collections || []).map((collection) => {
      const pair = getCollectionPairForCollectionConfig(pluginOptions.relations, collection)

      if (pair?.type === 'base') {
        collection = modifyBaseDocumentConfig(collection, pair.relation)
      }

      if (pair?.type === 'version') {
        collection = modifyVersionsCollectionConfig(collection, pair.relation)
      }

      return collection
    })

    /**
     * If the plugin is disabled, we still want to keep added collections/fields so the database schema is consistent which is important for migrations.
     * If your plugin heavily modifies the database schema, you may want to remove this property.
     */
    // if (pluginOptions.disabled) {
    //   return config
    // }

    if (!config.endpoints) {
      config.endpoints = []
    }

    if (!config.admin) {
      config.admin = {}
    }

    if (!config.admin.components) {
      config.admin.components = {}
    }

    if (!config.admin.components.beforeDashboard) {
      config.admin.components.beforeDashboard = []
    }

    return config
  }
