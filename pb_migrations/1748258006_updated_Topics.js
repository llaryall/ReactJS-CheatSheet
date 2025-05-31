/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2705931841")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_1wIraJdViW` ON `Topics` (`slug`)",
      "CREATE INDEX `idx_EsUMrfk4Wo` ON `Topics` (`category`)"
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
