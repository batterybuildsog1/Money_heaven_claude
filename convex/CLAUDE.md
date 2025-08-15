# Convex Directory Notes

This directory contains all of the backend logic that runs on the Convex platform.

## Authentication (`auth.ts`)

The `auth.ts` file is the heart of our authentication system. It uses the `convexAuth` function from `@convex-dev/auth/server` to:

1.  **Configure Providers:** Define the OAuth providers we use, like Google, along with their client IDs and secrets.
2.  **Export Backend Functions:** Export the necessary helpers (`auth`, `signIn`, `signOut`, etc.) for use in our other Convex functions (queries, mutations, and actions).

This file is the single source of truth for the backend's authentication configuration.
