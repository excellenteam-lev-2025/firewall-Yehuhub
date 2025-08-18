import {
  insertPortList,
  deletePortList,
  updatePorts,
  getAllExistingPorts,
  getAllPorts,
} from "../../../src/repository/PortRepository";
import { getDb } from "../../../src/services/DbService";
import { portTable } from "../../../src/db/schema";

const mockDb = {
  select: jest.fn(),
  transaction: jest.fn(),
  update: jest.fn(),
};

jest.mock("../../../src/services/DbService", () => ({
  getDb: jest.fn(() => mockDb),
}));

describe("PortRepository Tests", () => {
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

  describe("insertPortList Tests", () => {
    test("should insert ports successfully", async () => {
      const mockPortData = { values: [334, 282], mode: "blacklist" };

      await insertPortList(mockPortData);

      expect(mockDb.transaction).toHaveBeenCalledTimes(1);
      expect(insertMock).toHaveBeenCalledWith([
        { value: 334, mode: "blacklist" },
        { value: 282, mode: "blacklist" },
      ]);
    });

    test("should fail inserting ports", async () => {
      const mockPortData = { values: [1000000, -15], mode: "blacklist" };
      await expect(insertPortList(mockPortData)).rejects.toThrow();

      expect(mockDb.transaction).not.toHaveBeenCalled();
      expect(insertMock).not.toHaveBeenCalled();
    });
  });

  describe("deletePortList Tests", () => {
    test("should delete ports successfully", async () => {
      const mockPortData = { values: [-123123, 12312313], mode: "blacklist" };

      await deletePortList(mockPortData);

      expect(mockDb.transaction).toHaveBeenCalledTimes(1);
      expect(deleteMock).toHaveBeenCalledTimes(1);
      expect(deleteMock).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe("updatePorts", () => {
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

      await expect(updatePorts(input, tx)).rejects.toThrow(
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
        { id: 1, value: 334, active: true },
        { id: 2, value: 282, active: true },
      ];
      tx.update.mockReturnValueOnce({
        set: () => ({
          where: () => ({
            returning: async () => returningRows,
          }),
        }),
      });

      const input = { ids: [1, 2], mode: "blacklist", active: true };
      const result = await updatePorts(input, tx);

      expect(result).toEqual(returningRows);
      expect(tx.select).toHaveBeenCalled();
      expect(tx.update).toHaveBeenCalled();
    });
  });

  describe("getAllPorts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should return blacklist and whitelist Ports", async () => {
      const blacklistRows = [
        { id: 1, value: 334 },
        { id: 2, value: 500 },
      ];
      const whitelistRows = [{ id: 3, value: 400 }];

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

      const result = await getAllPorts();

      expect(result).toEqual({
        blacklist: blacklistRows,
        whitelist: whitelistRows,
      });

      expect(mockDb.select).toHaveBeenCalledTimes(2);
      expect(mockDb.select).toHaveBeenNthCalledWith(1, {
        id: portTable.id,
        value: portTable.value,
      });
      expect(mockDb.select).toHaveBeenNthCalledWith(2, {
        id: portTable.id,
        value: portTable.value,
      });
    });
  });

  describe("getAllExistingPorts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should return matching IPs", async () => {
      const mockRows = [
        { value: 334, mode: "blacklist" },
        { value: 282, mode: "blacklist" },
      ];

      (mockDb.select as jest.Mock).mockReturnValue({
        from: () => ({
          where: async () => mockRows,
        }),
      });

      const input = { values: [334, 282], mode: "blacklist" };
      const result = await getAllExistingPorts(input);

      expect(result).toEqual(mockRows);
      expect(mockDb.select).toHaveBeenCalledWith({
        value: portTable.value,
        mode: portTable.mode,
      });
    });
  });
});
