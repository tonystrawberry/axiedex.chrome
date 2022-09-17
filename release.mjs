/**
 * Script for generating ZIP files for both Chrome and Firefox extension store
 * Firefox does not support manifest version 3 yet so it is necessary to create a different ZIP file with version 2 for Mozilla
 */

await $`mkdir -p packages`

/* Create a ready-to-release package for the Chrome store */
await $`rm -rf dist`
await $`npm run build`
cd("dist")
await $`rm -f manifest_v2.json`
const { version } = await fs.readJson('manifest.json')
await $`mkdir -p ../packages/${version}`
await $`zip -r ../packages/${version}/${version}.chr.zip .`

/* Create a ready-to-release package for the Mozilla store */
cd("..")
await $`rm -rf dist`
await $`npm run build`
cd("dist")
await $`rm -f manifest.json`
await $`mv manifest_v2.json manifest.json`
await $`zip -r ../packages/${version}/${version}.moz.zip .`
