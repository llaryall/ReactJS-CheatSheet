# Setting Up Payload CMS for React Cheat Sheet

This guide will help you set up the migrated app with Payload CMS and PostgreSQL.

## Prerequisites

1. **PostgreSQL** installed and running
2. **Node.js** 20.9.0 or higher
3. **PocketBase** (for data migration only)

## Step 1: Set Up PostgreSQL Database

### Create the Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE react_cheat_sheet;

# Exit psql
\q
```

### Update Environment Variables

Edit `.env.local` and update the PostgreSQL connection string:

```env
DATABASE_URI=postgres://postgres:your_password@localhost:5432/react_cheat_sheet
```

Replace `your_password` with your actual PostgreSQL password.

## Step 2: Start the Development Server

```bash
npm run migrate:payload
npm run dev
```

Apply the checked-in Payload migrations before starting the app. Schema pushes are disabled
at runtime so a development server cannot make unreviewed database changes.
The admin panel is available at http://localhost:3000/admin.

## Step 3: Create Admin User

1. Navigate to http://localhost:3000/admin
2. Click "Create First User"
3. Enter your email and password
4. You now have access to the admin panel!

## Step 4: Migrate Data from PocketBase

### Start PocketBase

```bash
# In a separate terminal
./pocketbase.exe serve
```

### Run Migration

```bash
# In another terminal
npm run migrate
```

This will:
1. Connect to PocketBase and fetch all categories and topics
2. Convert the data to Payload format
3. Insert everything into PostgreSQL
4. Display progress and any errors

## Step 5: Verify the Migration

1. Go to http://localhost:3000/admin
2. Check that all categories and topics are present
3. Visit http://localhost:3000 to see the frontend

## Troubleshooting

### Database Connection Issues

If you see connection errors:

1. Make sure PostgreSQL is running
2. Verify the connection string in `.env.local`
3. Check that the database exists:
   ```bash
   psql -U postgres -l
   ```

### Migration Fails

If the migration fails:

1. Make sure PocketBase is running on http://127.0.0.1:8090
2. Verify PocketBase credentials in `.env.local`
3. Check the error message for details
4. You can re-run the migration (it will update existing records)

### Admin Panel Not Loading

If the admin panel doesn't load:

1. Check for build errors in the terminal
2. Make sure all dependencies are installed: `npm install`
3. Try clearing the `.next` folder: `rm -rf .next`

## Development Commands

```bash
# Start development server
npm run dev

# Explicitly synchronize the current Payload schema with PostgreSQL
npm run sync:schema

# Build for production
npm run build

# Start production server
npm start

# Run migration
npm run migrate

# Apply Payload database schema migrations
npm run migrate:payload

# Generate TypeScript types
npm run generate:types

# Generate import map
npm run generate:importmap
```

Schema synchronization is intentionally opt-in; normal app startup does not push schema changes.
Review any data-loss warnings before accepting a schema push.

## Project Structure

```
reactcheatsheet/
├── app/
│   ├── (payload)/          # Payload admin and API routes
│   │   ├── admin/          # Admin panel
│   │   ├── api/            # REST API endpoints
│   │   └── layout.tsx      # Payload layout
│   └── (my-app)/           # Your app routes
│       ├── page.js         # Homepage
│       ├── layout.js       # App layout
│       └── actions/        # Server actions
├── collections/            # Payload collections
│   ├── Categories.ts       # Categories collection
│   └── Topics.ts           # Topics collection
├── components/             # React components
├── scripts/                # Migration scripts
├── payload.config.ts       # Payload configuration
└── .env.local              # Environment variables
```

## API Endpoints

Payload automatically creates REST API endpoints:

- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get a category
- `POST /api/categories` - Create a category
- `PATCH /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

Same for `/api/topics`.

## GraphQL

Payload also provides GraphQL at `/api/graphql` (if enabled in config).

## Next Steps

1. **Customize the admin panel** - Add custom views, components, or fields
2. **Add authentication** - Protect your API endpoints
3. **Set up access control** - Define who can read/write data
4. **Add media uploads** - Store images and files
5. **Deploy to production** - See [Payload Deployment Docs](https://payloadcms.com/docs/deployment/overview)

## Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Payload + Next.js Guide](https://payloadcms.com/docs/getting-started/installation)
- [PostgreSQL Database](https://payloadcms.com/docs/database/postgres)
- [Rich Text Editor](https://payloadcms.com/docs/lexical/overview)
- [Access Control](https://payloadcms.com/docs/access-control/overview)
