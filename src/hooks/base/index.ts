import { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload/types'
import { Relation, VersionDocument } from '../../types'

export const buildCreateFirstVersionOnBaseCreate = (collectionPair: Relation) => {
  const hook: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
    if (operation !== 'create') return

    const version = await req.payload.create({
      collection: collectionPair.versionSlug,
      data: {
        // @ts-ignore
        base: doc.id,
      },
    })

    await req.payload.update({
      collection: collectionPair.baseSlug,
      id: doc.id,
      data: {
        versions: [version.id],
      },
    })

    return doc
  }

  return hook
}

export const buildDeleteCorrespondingVersions = (collectionPair: Relation) => {
  const hook: CollectionAfterDeleteHook = async ({ doc, req }) => {
    if (!doc?.versions) {
      return
    }

    const versionIds = doc.versions ? (doc.versions as VersionDocument[]).map(x => x.id) : []

    await req.payload.delete({
      collection: collectionPair.versionSlug,
      where: {
        id: { in: versionIds },
      },
      depth: 0,
    })
  }

  return hook
}
