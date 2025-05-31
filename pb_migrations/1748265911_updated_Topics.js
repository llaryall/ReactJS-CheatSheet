/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2705931841")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_1wIraJdViW` ON `Topics` (`slug`)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("relation105650625")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2705931841")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_1wIraJdViW` ON `Topics` (`slug`)",
      "CREATE INDEX `idx_EsUMrfk4Wo` ON `Topics` (`category`)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_484971879",
    "hidden": false,
    "id": "relation105650625",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "category",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
