import { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload/types'
import { Relation, VersionDocument } from '../../types'

export const buildCreateVersionIfPassedOnBaseCreate = (collectionPair: Relation) => {
  const hook: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
    if (operation !== 'create') return

    // We run this afterChange, so we can also place the base on the version we create.
    const versionData = req.body?.version

    if (!versionData) return doc

    let version
    try {
      // todo: try to pass user here
      version = await req.payload.create({
        collection: collectionPair.versionSlug,
        data: {
          // @ts-ignore
          base: doc.id,
          ...versionData,
        },
        req,
      })
    } catch (e) {
      try {
        await req.payload.delete({
          collection: collectionPair.baseSlug,
          id: doc.id,
          req,
        })
      } catch (e) {
        // If transactions are enabled, this will throw a 404, sincee the resource will already be rollbacked.
        // Necessary for transactions
      }
      return
    }

    await req.payload.update({
      collection: collectionPair.baseSlug,
      id: doc.id,
      data: {
        versions: [version.id],
      },
      req,
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
      req,
    })
  }

  return hook
}
