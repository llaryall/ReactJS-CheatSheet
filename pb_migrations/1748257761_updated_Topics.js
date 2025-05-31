/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2705931841")

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

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "select614373258",
    "maxSelect": 1,
    "name": "tier",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Basics",
      "Common Use",
      "Advanced"
    ]
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "number4101605491",
    "max": null,
    "min": null,
    "name": "display_order",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2705931841")

  // remove field
  collection.fields.removeById("relation105650625")

  // remove field
  collection.fields.removeById("select614373258")

  // remove field
  collection.fields.removeById("number4101605491")

  return app.save(collection)
})
