
import "server-only";

import {
  Account,
  Client,
  ID,
  Query,
  TablesDB,
  Users,
} from "node-appwrite";
import { cookies } from "next/headers";

function getConfig() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const rsvpTableId = process.env.APPWRITE_RSVP_TABLE_ID;
  const adminTableId = process.env.APPWRITE_ADMIN_TABLE_ID;
  const invitationsTableId =
    process.env.APPWRITE_INVITATIONS_TABLE_ID;

  if (
    !endpoint ||
    !projectId ||
    !apiKey ||
    !databaseId ||
    !rsvpTableId ||
    !adminTableId ||
    !invitationsTableId
  ) {
    throw new Error(
      "Appwrite server environment variables are incomplete."
    );
  }

  return {
    endpoint,
    projectId,
    apiKey,
    databaseId,
    rsvpTableId,
    adminTableId,
    invitationsTableId,
  };
}

export function getSessionCookieName() {
  return `a_session_${getConfig().projectId}`;
}

export function createAdminClient() {
  const config = getConfig();

  const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey(config.apiKey);

  return {
    client,
    tables: new TablesDB(client),
    users: new Users(client),
  };
}

export function createLoginClient() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId || !apiKey) {
    throw new Error("Appwrite login configuration is incomplete.");
  }

  // Server-side SSR authentication uses the server API key
  // to create the user session and obtain its secret.
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  return {
    client,
    account: new Account(client),
  };
}

export function createSessionClient(sessionSecret: string) {
  const config = getConfig();

  const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setSession(sessionSecret);

  return {
    client,
    account: new Account(client),
  };
}

export async function getCurrentAdmin() {
  try {
    const config = getConfig();
    const cookieStore = await cookies();
    const sessionSecret = cookieStore.get(getSessionCookieName())?.value;

    if (!sessionSecret) {
      return null;
    }

    const { account } = createSessionClient(sessionSecret);
    const user = await account.get();

    const { tables } = createAdminClient();

    const result = await tables.listRows({
      databaseId: config.databaseId,
      tableId: config.adminTableId,
      queries: [
        Query.equal("user_id", user.$id),
        Query.limit(1),
      ],
    });

    const staff = result.rows[0];

    if (!staff) {
      return null;
    }

    return {
      user,
      staff,
      isOwner: staff.role === "owner",
    };
  } catch {
    return null;
  }
}

export {
  ID,
  Query,
};
