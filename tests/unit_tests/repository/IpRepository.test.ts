import {
  insertIpList,
  deleteIpList,
  updateIps,
  getAllIps,
  getAllExistingIps,
} from "../../../src/repository/IpRepository";
import { db } from "../../../src/services/DbService";
import { ipTable } from "../../../src/db/schema";

jest.mock("../../../src/services/DbService", () => ({
  db: {
    select: jest.fn(),
    transaction: jest.fn(),
  },
}));

describe("IpRepository Tests", () => {
  const insertMock = jest.fn();
  const deleteMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (db.transaction as jest.Mock).mockImplementation(async (cb) => {
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

      expect(db.transaction).toHaveBeenCalledTimes(1);
      expect(insertMock).toHaveBeenCalledWith([
        { value: "1.1.1.1", mode: "blacklist" },
        { value: "2.2.2.2", mode: "blacklist" },
      ]);
    });

    test("should fail inserting ips", async () => {
      const mockIpData = { values: ["asdf", "2.2.2.2"], mode: "blacklist" };
      await expect(insertIpList(mockIpData)).rejects.toThrow();

      expect(db.transaction).not.toHaveBeenCalled();
      expect(insertMock).not.toHaveBeenCalled();
    });
  });

  describe("deleteIpList Tests", () => {
    test("should delete ips successfully", async () => {
      const mockIpData = { values: ["1.1.1.1", "2.2.2.2"], mode: "blacklist" };

      await deleteIpList(mockIpData);

      expect(db.transaction).toHaveBeenCalledTimes(1);
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

      (db.select as jest.Mock)
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

      expect(db.select).toHaveBeenCalledTimes(2);
      expect(db.select).toHaveBeenNthCalledWith(1, {
        id: ipTable.id,
        value: ipTable.value,
      });
      expect(db.select).toHaveBeenNthCalledWith(2, {
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

      (db.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: async () => mockRows,
        }),
      });

      const input = { values: ["1.1.1.1", "2.2.2.2"], mode: "blacklist" };
      const result = await getAllExistingIps(input);

      expect(result).toEqual(mockRows);
      expect(db.select).toHaveBeenCalledWith({
        value: ipTable.value,
        mode: ipTable.mode,
      });
    });
  });
});
