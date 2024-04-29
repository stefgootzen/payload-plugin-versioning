import {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
} from 'payload/types'
// import payload from 'payload'
import { getResource, getResourceId } from '../../utils'
import { BaseDocument, Relation, VersionDocument } from '../../types'

export const getLatestVersionForBase = async <T extends BaseDocument, I extends VersionDocument>(
  base: T,
): Promise<I | null> => {
  if (!base.versions || base.versions.length === 0) {
    return null
  }

  const versions = base.versions as I[]

  if (!versions[0]?.versionNumber) return null

  return versions.reduce((prev, current) => {
    return prev.versionNumber > current.versionNumber ? prev : current
  })
}

export const createSetVersionNumber = (collectionPair: Relation) => {
  const hook: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
    if (operation !== 'create') return

    const base = await getResource(data.base, collectionPair.baseSlug, req.payload)

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
  const hook: CollectionAfterDeleteHook = async ({ req, id }) => {
    const baseResults = await req.payload.find({
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

    const base = baseResults.docs[0] as unknown as BaseDocument

    const versionIds = base.versions
      ? (base.versions as VersionDocument[]).map(x => getResourceId(x)).filter(x => x !== id)
      : []

    await req.payload.update({
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

export const createAddVersionToBase = (collectionPair: Relation) => {
  const hook: CollectionAfterChangeHook = async ({ req, doc, operation }) => {
    if (operation !== 'create') return

    const baseId = getResourceId(doc.base)

    const base = await getResource<BaseDocument>(baseId, collectionPair.baseSlug, req.payload)

    const versionIds = base?.versions ? base.versions.map(x => getResourceId(x)) : []

    // something with, dont trigger hooks
    await req.payload.update({
      collection: collectionPair.baseSlug,
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
