/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2705931841")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select614373258",
    "maxSelect": 1,
    "name": "tier",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "🟢",
      "🔵",
      "🟣"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2705931841")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select614373258",
    "maxSelect": 1,
    "name": "tier",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "🟢",
      "🔵",
      "🔴"
    ]
  }))

  return app.save(collection)
})
