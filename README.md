# Payload-Plugin-Versioning
PayloadCMS plugin that setups all necessary fields and hooks to enable collection versioning.

## Installation
- To be added in NPM register.

- Add the following to the `plugin` section of the payload config. Apply your own slugs.

```javascript
 withVersioning({
  enabled: true,
  relations: [
    {
      baseSlug: '[base-slug]',
      versionSlug: '[version-slug]',
    },
  ],
})
```

## Payload Compatibility
| Payload | Plugin-Versioning |
|---------|-------------------|
| 2.x     | Compatible        |
| 3.x     | Untested          |


## Effects
**_One-to-many_ relationship management:**
- Adds `versions` field _(many)_ on `base` collection.
- Adds `base` field _(one)_ on `version` collection.

**Version number management:**
- Adds `VersionNumber` field on _version_.

**Creation and deletion hooks:**
- Creates first `version` automatically on creation of `base`.
- Deletes all `versions` on `base` delete.

## Why use this instead of build-in versioning?
Payload's build-in versioning is useful when you've got a concept of a (latest) _published_ document. This plugin is for you if versions are supposed to be "published".

## Known limitations
- Automatic create only works with no-required fields.
