const mockDb = {
  select: jest.fn(),
  transaction: jest.fn(),
  update: jest.fn(),
};

jest.mock("../../../src/services/DbService", () => ({
  getDb: jest.fn(() => mockDb),
}));

import {
  insertIpList,
  deleteIpList,
  updateIps,
  getAllIps,
  findExistingIps,
} from "../../../src/repository/IpRepository";
import { getDb } from "../../../src/services/DbService";
import { ipTable } from "../../../src/db/schema";

describe("IpRepository Tests", () => {
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

  describe("insertIpList Tests", () => {
    test("should insert ips successfully", async () => {
      const mockIpData = { values: ["1.1.1.1", "2.2.2.2"], mode: "blacklist" };

      await insertIpList(mockIpData);

      expect(mockDb.transaction).toHaveBeenCalledTimes(1);
      expect(insertMock).toHaveBeenCalledWith([
        { value: "1.1.1.1", mode: "blacklist" },
        { value: "2.2.2.2", mode: "blacklist" },
      ]);
    });

    test("should fail inserting ips", async () => {
      const mockIpData = { values: ["asdf", "2.2.2.2"], mode: "blacklist" };
      await expect(insertIpList(mockIpData)).rejects.toThrow();

      expect(mockDb.transaction).not.toHaveBeenCalled();
      expect(insertMock).not.toHaveBeenCalled();
    });
  });

  describe("deleteIpList Tests", () => {
    test("should delete ips successfully", async () => {
      const mockIpData = { values: ["1.1.1.1", "2.2.2.2"], mode: "blacklist" };

      await deleteIpList(mockIpData);

      expect(mockDb.transaction).toHaveBeenCalledTimes(1);
      expect(deleteMock).toHaveBeenCalledTimes(1);
      expect(deleteMock).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe("updateIps", () => {
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

      await expect(updateIps(input, tx)).rejects.toThrow(
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
        { id: 1, value: "1.1.1.1", active: true },
        { id: 2, value: "2.2.2.2", active: true },
      ];
      tx.update.mockReturnValueOnce({
        set: () => ({
          where: () => ({
            returning: async () => returningRows,
          }),
        }),
      });

      const input = { ids: [1, 2], mode: "blacklist", active: true };
      const result = await updateIps(input, tx);

      expect(result).toEqual(returningRows);
      expect(tx.select).toHaveBeenCalled();
      expect(tx.update).toHaveBeenCalled();
    });
  });

  describe("getAllIps", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should return blacklist and whitelist IPs", async () => {
      const blacklistRows = [
        { id: 1, value: "1.1.1.1" },
        { id: 2, value: "2.2.2.2" },
      ];
      const whitelistRows = [{ id: 3, value: "3.3.3.3" }];

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

      const result = await getAllIps();

      expect(result).toEqual({
        blacklist: blacklistRows,
        whitelist: whitelistRows,
      });

      expect(mockDb.select).toHaveBeenCalledTimes(2);
      expect(mockDb.select).toHaveBeenNthCalledWith(1, {
        id: ipTable.id,
        value: ipTable.value,
      });
      expect(mockDb.select).toHaveBeenNthCalledWith(2, {
        id: ipTable.id,
        value: ipTable.value,
      });
    });
  });

  describe("getAllExistingIps", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should return matching IPs", async () => {
      const mockRows = [
        { value: "1.1.1.1", mode: "blacklist" },
        { value: "2.2.2.2", mode: "blacklist" },
      ];

      (mockDb.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: async () => mockRows,
        }),
      });

      const input = { values: ["1.1.1.1", "2.2.2.2"], mode: "blacklist" };
      const result = await findExistingIps(input);

      expect(result).toEqual(mockRows);
      expect(mockDb.select).toHaveBeenCalledWith({
        value: ipTable.value,
        mode: ipTable.mode,
      });
    });
  });
});
