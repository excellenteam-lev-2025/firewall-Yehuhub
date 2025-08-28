const mockDb = {
  select: jest.fn(),
  transaction: jest.fn(),
  update: jest.fn(),
};

jest.mock("../../../src/services/DbService", () => ({
  getDb: jest.fn(() => mockDb),
}));

import {
  insertUrlList,
  deleteUrlList,
  getAllUrls,
  findExistingUrls,
  updateUrls,
} from "../../../src/repository/UrlRepository";
import { getDb } from "../../../src/services/DbService";
import { urlTable } from "../../../src/db/schema";

describe("UrlRepository Tests", () => {
  const insertMock = jest.fn();
  const deleteMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (mockDb.transaction as jest.Mock).mockImplementation(async (cb) => {
      await cb({
        insert: () => ({ values: insertMock }),
        delete: () => ({ where: deleteMock }),
      });
    });
  });

  describe("insertUrlList Tests", () => {
    test("should insert urls successfully", async () => {
      const mockUrlData = {
        values: ["COOL.com", "really-COOL.com"],
        mode: "blacklist",
      };

      await insertUrlList(mockUrlData);

      expect(mockDb.transaction).toHaveBeenCalledTimes(1);
      expect(insertMock).toHaveBeenCalledWith([
        { value: "COOL.com", mode: "blacklist" },
        { value: "really-COOL.com", mode: "blacklist" },
      ]);
    });

    test("should fail inserting urls", async () => {
      const mockUrlData = { values: ["asdf", "COOL.com"], mode: "blacklist" };
      await expect(insertUrlList(mockUrlData)).rejects.toThrow();

      expect(mockDb.transaction).not.toHaveBeenCalled();
      expect(insertMock).not.toHaveBeenCalled();
    });
  });

  describe("deleteUrlList Tests", () => {
    test("should delete urls successfully", async () => {
      const mockUrlData = {
        values: ["really-COOL.com", "COOL.com"],
        mode: "blacklist",
      };

      await deleteUrlList(mockUrlData);

      expect(mockDb.transaction).toHaveBeenCalledTimes(1);
      expect(deleteMock).toHaveBeenCalledTimes(1);
      expect(deleteMock).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe("updateUrls", () => {
    let tx: any;

    beforeEach(() => {
      tx = {
        select: jest.fn(),
        update: jest.fn(),
      };
    });

    test("should throw error if some IDs are not found", async () => {
      tx.select.mockReturnValueOnce({
        from: () => ({
          where: async () => [{ id: 1 }],
        }),
      });

      const input = { ids: [1, 2], mode: "blacklist", active: true };

      await expect(updateUrls(input, tx)).rejects.toThrow(
        "One or more of the requested id's not found"
      );
    });

    test("should update and return rows if all IDs are found", async () => {
      tx.select.mockReturnValueOnce({
        from: () => ({
          where: async () => [{ id: 1 }, { id: 2 }],
        }),
      });

      const returningRows = [
        { id: 1, value: "cool.com", active: true },
        { id: 2, value: "really-cool.com", active: true },
      ];
      tx.update.mockReturnValueOnce({
        set: () => ({
          where: () => ({
            returning: async () => returningRows,
          }),
        }),
      });

      const input = { ids: [1, 2], mode: "blacklist", active: true };
      const result = await updateUrls(input, tx);

      expect(result).toEqual(returningRows);
      expect(tx.select).toHaveBeenCalled();
      expect(tx.update).toHaveBeenCalled();
    });
  });

  describe("getAllUrls", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should return blacklist and whitelist URLs", async () => {
      const blacklistRows = [
        { id: 1, value: "cool.com" },
        { id: 2, value: "really-cool.com" },
      ];
      const whitelistRows = [{ id: 3, value: "real-cool.com" }];

      (mockDb.select as jest.Mock)
        .mockReturnValueOnce({
          from: () => ({
            where: async () => blacklistRows,
          }),
        })
        .mockReturnValueOnce({
          from: () => ({
            where: async () => whitelistRows,
          }),
        });

      const result = await getAllUrls();

      expect(result).toEqual({
        blacklist: blacklistRows,
        whitelist: whitelistRows,
      });

      expect(mockDb.select).toHaveBeenCalledTimes(2);
      expect(mockDb.select).toHaveBeenNthCalledWith(1, {
        id: urlTable.id,
        value: urlTable.value,
      });
      expect(mockDb.select).toHaveBeenNthCalledWith(2, {
        id: urlTable.id,
        value: urlTable.value,
      });
    });
  });

  describe("getAllExistingUrls", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should return matching URLs", async () => {
      const mockRows = [
        { value: "cool.com", mode: "blacklist" },
        { value: "really-cool.com", mode: "blacklist" },
      ];

      (mockDb.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: async () => mockRows,
        }),
      });

      const input = {
        values: ["cool.com", "really-cool.com"],
        mode: "blacklist",
      };
      const result = await findExistingUrls(input);

      expect(result).toEqual(mockRows);
      expect(mockDb.select).toHaveBeenCalledWith({
        value: urlTable.value,
        mode: urlTable.mode,
      });
    });
  });
});
