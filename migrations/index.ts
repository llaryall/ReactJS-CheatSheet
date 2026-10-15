import * as migration_20261015_181300_add_localized_content_tables from './20261015_181300_add_localized_content_tables'

export const migrations = [
  {
    up: migration_20261015_181300_add_localized_content_tables.up,
    down: migration_20261015_181300_add_localized_content_tables.down,
    name: '20261015_181300_add_localized_content_tables',
  },
]
