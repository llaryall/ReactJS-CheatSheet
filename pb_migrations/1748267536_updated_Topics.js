/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2705931841")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_p4R2NKrPwc` ON `Topics` (\n  `slug`,\n  `categories`\n)"
    ]
  }, collection)

  // update field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_484971879",
    "hidden": false,
    "id": "relation2448836153",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "categories",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2705931841")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_p4R2NKrPwc` ON `Topics` (\n  `slug`,\n  `topics`\n)"
    ]
  }, collection)

  // update field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_484971879",
    "hidden": false,
    "id": "relation2448836153",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "topics",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
