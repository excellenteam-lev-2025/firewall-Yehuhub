import * as DbService from "../../../src/services/DbService";

import { getDb, testDbConnection } from "../../../src/services/DbService";
import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "../../../src/config/env";

jest.mock("drizzle-orm/node-postgres", () => ({
  drizzle: jest.fn(),
}));

describe("DbService", () => {
  let getDb: any;
  let mockDrizzle: jest.Mock;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    ({ getDb } = require("../../../src/services/DbService"));
    ({ drizzle: mockDrizzle } = require("drizzle-orm/node-postgres"));
  });

  test("getDb returns a singleton instance", () => {
    const mockDrizzleInstance = { query: jest.fn() };
    mockDrizzle.mockReturnValue(mockDrizzleInstance);
    const db1 = getDb();
    const db2 = getDb();

    expect(db1).toBe(db2);
    expect(db1).toBe(mockDrizzleInstance);
  });

  test("succeeds on first attempt", async () => {
    const executeMock = jest.fn().mockResolvedValue(1);
    jest
      .spyOn(DbService, "getDb")
      .mockReturnValue({ execute: executeMock } as any);

    await DbService.testDbConnection();

    expect(executeMock).toHaveBeenCalledTimes(1);
  });
});
