import { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload/types'
import payload from 'payload'
import { Relation } from '../../types'

export const buildCreateFirstVersionOnBaseCreate = (collectionPair: Relation) => {
  const hook: CollectionAfterChangeHook = async ({ doc, operation }) => {
    if (operation !== 'create') return

    const version = await payload.create({
      collection: collectionPair.versionSlug,
      data: {
        // @ts-ignore
        base: doc.id,
      },
    })

    await payload.update({
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
  const hook: CollectionAfterDeleteHook = async ({ doc }) => {
    if (!doc?.versions) {
      return
    }

    const versionIds = doc.versions ? doc.versions.map(x => x.id) : []

    await payload.delete({
      collection: collectionPair.versionSlug,
      where: {
        id: { in: versionIds },
      },
      depth: 0,
    })
  }

  return hook
}
