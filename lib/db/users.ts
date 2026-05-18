import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as usersSchema from "@/drizzle/users/schema";
import { getServerEnv } from "@/lib/env";

const globalForUsersDb = globalThis as unknown as {
  usersQueryClient: ReturnType<typeof postgres> | undefined;
};

function createUsersQueryClient() {
  const env = getServerEnv();
  return postgres(env.DATABASE_URL_USERS, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
}

export function getUsersDb() {
  if (!globalForUsersDb.usersQueryClient) {
    globalForUsersDb.usersQueryClient = createUsersQueryClient();
  }
  return drizzle(globalForUsersDb.usersQueryClient, { schema: usersSchema });
}

export type UsersDatabase = ReturnType<typeof getUsersDb>;
