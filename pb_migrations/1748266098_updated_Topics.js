/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2705931841")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_p4R2NKrPwc` ON `Topics` (\n  `slug`,\n  `topics`\n)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2705931841")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_1wIraJdViW` ON `Topics` (`slug`)"
    ]
  }, collection)

  return app.save(collection)
})
