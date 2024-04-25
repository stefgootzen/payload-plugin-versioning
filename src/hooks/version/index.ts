import {
  Collection,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
} from 'payload/types'
import payload from 'payload'
import { CollectionType, getResource, getResourceId } from '../../utils'
import { Relation } from '../../types'

export const getLatestVersionForBase = async (base: any): Promise<any | null> => {
  if (!base.versions || base.versions.length === 0) {
    return null
  }

  const versions = base.versions

  if (!versions[0]?.versionNumber) return null

  return versions.reduce((prev, current) => {
    return prev.versionNumber > current.versionNumber ? prev : current
  })
}

export const createSetVersionNumber = (collectionPair: Relation) => {
  const hook: CollectionBeforeChangeHook = async ({ data, operation }) => {
    if (operation !== 'create') return

    const base = await getResource(data.base, collectionPair.baseSlug)

    const prevLatestVersion = await getLatestVersionForBase(base)

    const newVersion = prevLatestVersion ? prevLatestVersion.versionNumber + 1 : 1

    return {
      ...data,
      versionNumber: newVersion,
    }
  }

  return hook
}

export const createRemoveVersionFromBase = (collectionPair: Relation) => {
  const hook: CollectionAfterDeleteHook = async ({ id }) => {
    const baseResults = await payload.find({
      collection: collectionPair.baseSlug,
      where: {
        versions: {
          contains: id,
        },
      },
    })

    // In this case deleting of the annotation resulted in this version being deleted,
    // thus triggering this afterDelete hook. So we don't have to clean up.
    if (baseResults.totalDocs === 0) {
      return
    }

    const base = baseResults.docs[0]

    const versionIds = base.versions
      ? base.versions.filter(x => x !== id).map(x => getResourceId(x))
      : []

    await payload.update({
      collection: collectionPair.baseSlug,
      id: base.id,
      data: {
        versions: versionIds,
      },
      depth: 0,
    })
  }

  return hook
}

export const createAddVersionToBase = (baseSlug: CollectionType) => {
  const hook: CollectionAfterChangeHook = async ({ doc, operation }) => {
    if (operation !== 'create') return

    const baseId = getResourceId(doc.base)

    const base = await getResource(baseId, baseSlug)

    const versionIds = base?.versions ? base.versions.map(x => getResourceId(x)) : []

    // something with, dont trigger hooks
    await payload.update({
      collection: baseSlug,
      // @ts-ignore
      id: baseId,
      data: {
        versions: [...versionIds, doc.id],
      },
    })

    return doc
  }

  return hook
}
