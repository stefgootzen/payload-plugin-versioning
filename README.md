# Payload-Plugin-Versioning
PayloadCMS plugin that sets up all necessary fields and hooks to enable collection versioning.

## Installation
1. Run `npm install @stefgootzen/payload-plugin-versioning` or `yarn add @stefgootzen/payload-plugin-versioning`.


2. Add the following to the `plugin` section of the payload config. Use your own collections.

```javascript
 withVersioning({
  enabled: true,
  relations: [
    {
      baseSlug: MyBaseCollection.slug,
      versionSlug: MyVersionCollection.slug,
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
- On `Base` create: Creates first `version` and sets it on `base`.
- On `version` delete: Deletes `version` on `base`.
- On `Base` delete: Deletes all corresponding `versions`.

## Why use this instead of build-in versioning?
Payload's build-in versioning is useful when you've got a concept of a (latest) _published_ document. This plugin is for you if versions are supposed to be "published".

## Known limitations
- Automatic create only works with no-required fields.
