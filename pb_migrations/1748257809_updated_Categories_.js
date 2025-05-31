/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_484971879")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_4hN3akaDij` ON `Categories` (\n  `slug`,\n  `name`\n)"
    ],
    "name": "Categories"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_484971879")

  // update collection data
  unmarshal({
    "indexes": [],
    "name": "Categories_"
  }, collection)

  return app.save(collection)
})
