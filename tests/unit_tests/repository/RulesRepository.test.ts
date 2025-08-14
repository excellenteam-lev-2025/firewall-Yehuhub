import { toggleStatus } from "../../../src/repository/RulesRepository";
import { db } from "../../../src/services/DbService";
import { updateUrls } from "../../../src/repository/UrlRepository";
import { updatePorts } from "../../../src/repository/PortRepository";
import { updateIps } from "../../../src/repository/IpRepository";

jest.mock("../../../src/services/DbService", () => ({
  db: {
    transaction: jest.fn(),
  },
}));

jest.mock("../../../src/repository/IpRepository");
jest.mock("../../../src/repository/UrlRepository");
jest.mock("../../../src/repository/PortRepository");

describe("toggleStatus", () => {
  const mockTx = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should call all update functions and return combined result", async () => {
    // Arrange
    const urlsInput = { ids: [1], mode: "blacklist", active: true };
    const portsInput = { ids: [2], mode: "blacklist", active: false };
    const ipsInput = { ids: [3], mode: "blacklist", active: true };

    const updatedUrls = [{ id: 1, active: true }];
    const updatedPorts = [{ id: 2, active: false }];
    const updatedIps = [{ id: 3, active: true }];

    (updateUrls as jest.Mock).mockResolvedValue(updatedUrls);
    (updatePorts as jest.Mock).mockResolvedValue(updatedPorts);
    (updateIps as jest.Mock).mockResolvedValue(updatedIps);

    // Mock db.transaction to immediately execute the callback with fake tx
    (db.transaction as jest.Mock).mockImplementation(async (callback) => {
      return callback(mockTx);
    });

    // Act
    const result = await toggleStatus({
      urls: urlsInput,
      ports: portsInput,
      ips: ipsInput,
    });

    // Assert
    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(updateUrls).toHaveBeenCalledWith(urlsInput, mockTx);
    expect(updatePorts).toHaveBeenCalledWith(portsInput, mockTx);
    expect(updateIps).toHaveBeenCalledWith(ipsInput, mockTx);

    expect(result).toEqual({
      updatedUrls,
      updatedPorts,
      updatedIps,
    });
  });

  test("should propagate error if any update function fails", async () => {
    const error = new Error("Something went wrong");
    (updateUrls as jest.Mock).mockRejectedValue(error);
    (db.transaction as jest.Mock).mockImplementation(async (callback) =>
      callback(mockTx)
    );

    await expect(
      toggleStatus({
        urls: { ids: [1], mode: "blacklist", active: true },
        ports: { ids: [], mode: "blacklist", active: true },
        ips: { ids: [], mode: "blacklist", active: true },
      })
    ).rejects.toThrow("Something went wrong");
  });
});
