import type { Plugin } from 'payload/config'

import type { PluginTypes, Relation } from './types'
import { CollectionConfig } from 'payload/types'
import {
  createAddVersionToBase,
  createRemoveVersionFromBase,
  createSetVersionNumber,
} from './hooks/version'
import { buildCreateFirstVersionOnBaseCreate, buildDeleteCorrespondingVersions } from './hooks/base'

type PluginType = (pluginOptions: PluginTypes) => Plugin

const modifyBaseCollectionConfig = (
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
      required: true,
    },
  ]

  collection.hooks = {
    ...collection.hooks,
    afterChange: [
      buildCreateFirstVersionOnBaseCreate(collectionPair),
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
  const baseSlugs = relationItems.map(pair => pair.baseSlug)
  const versionSlugs = relationItems.map(pair => pair.versionSlug)

  if (baseSlugs.includes(config.slug)) {
    return {
      type: 'base',
      relation: relationItems.find(pair => pair.baseSlug === config.slug)!,
    }
  }

  if (versionSlugs.includes(config.slug)) {
    return {
      type: 'version',
      relation: relationItems.find(pair => pair.versionSlug === config.slug)!,
    }
  }

  return null
}
export const withVersioning =
  (pluginOptions: PluginTypes): Plugin =>
  incomingConfig => {
    let config = { ...incomingConfig }

    if (pluginOptions.enabled === false) {
      return config
    }

    config.collections = (config.collections || []).reduce((acc, collection) => {
      const pair = getCollectionPairForCollectionConfig(pluginOptions.relations, collection)

      if (pair?.type === 'base') {
        collection = modifyBaseCollectionConfig(collection, pair.relation)
      }

      if (pair?.type === 'version') {
        collection = modifyVersionsCollectionConfig(collection, pair.relation)
      }

      return [...acc, collection]
    }, [] as CollectionConfig[])

    return config
  }
