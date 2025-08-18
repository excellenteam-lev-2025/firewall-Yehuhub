import {
  addIp,
  removeIp,
  validateIpList,
} from "../../../src/controllers/IpController";
import { ZodError } from "zod";
import {
  getAllExistingIps,
  insertIpList,
  deleteIpList,
} from "../../../src/repository/IpRepository";
import { StatusCodes } from "http-status-codes";

jest.mock("../../../src/repository/IpRepository");

describe("IpController Tests", () => {
  describe("validateIpList Middleware", () => {
    let req: any;
    let res: any;
    let next: jest.Mock;

    beforeEach(() => {
      req = { body: {} };
      res = {};
      next = jest.fn();
    });

    test("calls next without error if request body is valid", () => {
      req.body = { values: ["1.1.1.1"], mode: "blacklist" };

      validateIpList(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(); // no arguments = no error
    });

    test("calls next with error if request body is invalid", () => {
      req.body = { values: ["bad-ip"], mode: "blacklist" }; // invalid according to schema

      validateIpList(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const errorArg = next.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(ZodError);
    });
  });

  describe("addIp Tests", () => {
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
    });

    test("should call insertIpList and send success response", async () => {
      req.body = { values: ["1.1.1.1"], mode: "blacklist" };

      await addIp(req, res, next);

      expect(insertIpList).toHaveBeenCalledTimes(1);
      expect(insertIpList).toHaveBeenCalledWith({
        values: ["1.1.1.1"],
        mode: "blacklist",
      });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        type: "ip",
        mode: "blacklist",
        values: ["1.1.1.1"],
        status: "success",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("removeIp Tests", () => {
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

    test("should delete IPs and return success if all IPs exist", async () => {
      req.body = { values: ["1.1.1.1"], mode: "blacklist" };
      (getAllExistingIps as jest.Mock).mockResolvedValue([
        { value: "1.1.1.1" },
      ]);
      (deleteIpList as jest.Mock).mockResolvedValue(undefined);

      await removeIp(req, res, next);

      expect(getAllExistingIps).toHaveBeenCalledWith({
        mode: "blacklist",
        values: ["1.1.1.1"],
      });
      expect(deleteIpList).toHaveBeenCalledWith({
        mode: "blacklist",
        values: ["1.1.1.1"],
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        type: "ip",
        mode: "blacklist",
        values: ["1.1.1.1"],
        status: "success",
      });
    });

    test("should fail deleting IPs and return Bad Request", async () => {
      req.body = { values: ["1.1.1.1", "2.2.2.2"], mode: "blacklist" };
      (getAllExistingIps as jest.Mock).mockResolvedValue([
        { value: "1.1.1.1" },
      ]);

      await removeIp(req, res, next);

      expect(getAllExistingIps).toHaveBeenCalledWith({
        values: ["1.1.1.1", "2.2.2.2"],
        mode: "blacklist",
      });

      expect(deleteIpList).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "One or more IP addresses not found in the database",
      });
    });
  });
});
