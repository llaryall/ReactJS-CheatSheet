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
      "CREATE INDEX `idx_1wIraJdViW` ON `Topics` (\n  `slug`,\n  `category`\n)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2705931841",
    "hidden": false,
    "id": "relation105650625",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "category",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
