import { CollectionConfig } from 'payload/types'

import { CollectionBeforeChangeHook } from 'payload/types'

export const attachCreatedBy: CollectionBeforeChangeHook = async ({ req, operation, data }) => {
  if (operation === 'create' && req.user) {
    data.createdBy = req.user.id
  }

  return data
}

const Versions: CollectionConfig = {
  slug: 'versions',
  admin: {},
  hooks: {
    beforeChange: [attachCreatedBy],
  },
  fields: [
    {
      name: 'someField',
      type: 'text',
      required: true,
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      required: false,
    },
  ],
}

export default Versions
