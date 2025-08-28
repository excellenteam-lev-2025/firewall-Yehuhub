import {
  addPorts,
  removePorts,
  validatePortList,
} from "../../../src/controllers/PortController";
import { ZodError } from "zod";
import {
  findExistingPorts,
  insertPortList,
  deletePortList,
} from "../../../src/repository/PortRepository";
import { StatusCodes } from "http-status-codes";

jest.mock("../../../src/repository/PortRepository");

describe("PortController Tests", () => {
  describe("validatePortList Middleware", () => {
    let req: any;
    let res: any;
    let next: jest.Mock;

    beforeEach(() => {
      req = { body: {} };
      res = {};
      next = jest.fn();
    });

    test("calls next without error if request body is valid", () => {
      req.body = { values: [334], mode: "blacklist" };

      validatePortList(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(); // no arguments = no error
    });

    test("calls next with error if request body is invalid", () => {
      req.body = { values: ["bad-port"], mode: "blacklist" }; // invalid according to schema

      validatePortList(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const errorArg = next.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(ZodError);
    });
  });

  describe("addPorts Tests", () => {
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

    test("should call insertPortList and send success response", async () => {
      req.body = { values: [334, 282], mode: "blacklist" };

      await addPorts(req, res, next);

      expect(insertPortList).toHaveBeenCalledTimes(1);
      expect(insertPortList).toHaveBeenCalledWith({
        values: [334, 282],
        mode: "blacklist",
      });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        type: "port",
        mode: "blacklist",
        values: [334, 282],
        status: "success",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("removePorts Tests", () => {
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

    test("should delete PORTS and return success if all PORTS exist", async () => {
      req.body = { values: [334], mode: "blacklist" };
      (findExistingPorts as jest.Mock).mockResolvedValue([{ value: 334 }]);
      (deletePortList as jest.Mock).mockResolvedValue(undefined);

      await removePorts(req, res, next);

      expect(findExistingPorts).toHaveBeenCalledWith({
        mode: "blacklist",
        values: [334],
      });
      expect(deletePortList).toHaveBeenCalledWith({
        mode: "blacklist",
        values: [334],
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        type: "port",
        mode: "blacklist",
        values: [334],
        status: "success",
      });
    });

    test("should fail deleting ports when a port does not exist in the db and return Bad Request", async () => {
      req.body = { values: [333, 222], mode: "blacklist" };
      (findExistingPorts as jest.Mock).mockResolvedValue([{ value: 333 }]);

      await removePorts(req, res, next);

      expect(findExistingPorts).toHaveBeenCalledWith({
        values: [333, 222],
        mode: "blacklist",
      });

      expect(deletePortList).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "One or more ports not found in the database",
      });
    });
  });
});
