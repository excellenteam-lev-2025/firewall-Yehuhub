import { ZodError } from "zod";
import {
  validateUpdateObject,
  getAllRules,
  toggleRuleStatus,
} from "../../../src/controllers/RulesController";
import { updateAllSchema } from "../../../src/schemas/UpdateListSchema";
import { getAllIps } from "../../../src/repository/IpRepository";
import { getAllUrls } from "../../../src/repository/UrlRepository";
import { getAllPorts } from "../../../src/repository/PortRepository";
import { toggleStatus } from "../../../src/repository/RulesRepository";
import { StatusCodes } from "http-status-codes";

jest.mock("../../../src/schemas/UpdateListSchema", () => ({
  updateAllSchema: {
    parse: jest.fn(),
  },
}));

jest.mock("../../../src/repository/IpRepository");
jest.mock("../../../src/repository/UrlRepository");
jest.mock("../../../src/repository/PortRepository");
jest.mock("../../../src/repository/RulesRepository");

const mockParse = updateAllSchema.parse as jest.Mock;

describe("Rules Controller", () => {
  describe("validateUpdateObject", () => {
    let req: any;
    let res: any;
    let next: jest.Mock;

    beforeEach(() => {
      req = { body: {} };
      res = {};
      next = jest.fn();
      jest.clearAllMocks();
    });

    test("should call next with no error if validation passes", async () => {
      req.body = {
        urls: { ids: [1], mode: "blacklist", active: true },
        ports: { ids: [2], mode: "blacklist", active: false },
        ips: { ids: [3], mode: "blacklist", active: true },
      };

      await validateUpdateObject(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    test("should call next with error if validation fails", async () => {
      const zodError = new ZodError([]);
      mockParse.mockImplementation(() => {
        throw zodError;
      });

      req.body = {
        urls: { ids: ["asd"], mode: "blacklist", active: true },
        ports: { ids: [2], mode: "blacklist", active: false },
        ips: { ids: [3], mode: "blacklist", active: true },
      };

      await validateUpdateObject(req, res, next);

      expect(next).toHaveBeenCalledWith(zodError);
    });
  });

  describe("getAllRules", () => {
    let req: any;
    let res: any;
    let next: jest.Mock;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
      jest.clearAllMocks();
    });

    test("should return all rules successfully", async () => {
      (getAllIps as jest.Mock).mockResolvedValue([{ id: 1, value: "1.1.1.1" }]);
      (getAllUrls as jest.Mock).mockResolvedValue([
        { id: 1, value: "example.com" },
      ]);
      (getAllPorts as jest.Mock).mockResolvedValue([{ id: 1, value: 8080 }]);

      await getAllRules(req, res, next);

      expect(getAllIps).toHaveBeenCalledTimes(1);
      expect(getAllUrls).toHaveBeenCalledTimes(1);
      expect(getAllPorts).toHaveBeenCalledTimes(1);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        ips: [{ id: 1, value: "1.1.1.1" }],
        urls: [{ id: 1, value: "example.com" }],
        ports: [{ id: 1, value: 8080 }],
      });
    });
  });

  describe("toggleRuleStatus Controller", () => {
    let req: any;
    let res: any;
    let next: jest.Mock;

    beforeEach(() => {
      req = { body: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
      jest.clearAllMocks();
    });

    test("should toggle rules successfully", async () => {
      req.body = {
        urls: { ids: [1], mode: "blacklist", active: true },
        ports: { ids: [2], mode: "blacklist", active: false },
        ips: { ids: [3], mode: "blacklist", active: true },
      };

      (updateAllSchema.parse as jest.Mock).mockImplementation((data) => data);

      const mockResult = { updatedUrls: [], updatedPorts: [], updatedIps: [] };
      (toggleStatus as jest.Mock).mockResolvedValue(mockResult);

      await toggleRuleStatus(req, res, next);

      expect(updateAllSchema.parse).toHaveBeenCalledWith(req.body);
      expect(toggleStatus).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith(mockResult);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
