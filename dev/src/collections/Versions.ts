import { CollectionConfig } from 'payload/types'

// Example Collection - For reference only, this must be added to payload.config.ts to be used.
const Versions: CollectionConfig = {
  slug: 'versions',
  admin: {},
  fields: [
    {
      name: 'someField',
      type: 'text',
      required: true,
    },
  ],
}

export default Versions
