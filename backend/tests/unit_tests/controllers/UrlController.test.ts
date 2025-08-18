import {
  addUrls,
  removeUrls,
  validateUrlList,
} from "../../../src/controllers/UrlController";
import { ZodError } from "zod";

import {
  getAllExistingUrls,
  insertUrlList,
  deleteUrlList,
} from "../../../src/repository/UrlRepository";
import { StatusCodes } from "http-status-codes";

jest.mock("../../../src/repository/UrlRepository");

describe("UrlController Tests", () => {
  describe("validateUrlList Middleware", () => {
    let req: any;
    let res: any;
    let next: jest.Mock;

    beforeEach(() => {
      req = { body: {} };
      res = {};
      next = jest.fn();
    });

    test("calls next without error if request body is valid", () => {
      req.body = { values: ["COOL.com"], mode: "blacklist" };

      validateUrlList(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    test("calls next with error if request body is invalid", () => {
      req.body = { values: ["bad-url"], mode: "blacklist" };

      validateUrlList(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const errorArg = next.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(ZodError);
    });
  });

  describe("addUrl Tests", () => {
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

    test("should call insertUrlList and send success response", async () => {
      req.body = { values: ["COOL.com"], mode: "blacklist" };

      await addUrls(req, res, next);

      expect(insertUrlList).toHaveBeenCalledTimes(1);
      expect(insertUrlList).toHaveBeenCalledWith({
        values: ["COOL.com"],
        mode: "blacklist",
      });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        type: "url",
        mode: "blacklist",
        values: ["COOL.com"],
        status: "success",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("removeUrl Tests", () => {
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

    test("should delete URLs and return success if all URLs exist", async () => {
      req.body = { values: ["cool.com"], mode: "blacklist" };
      (getAllExistingUrls as jest.Mock).mockResolvedValue([
        { value: "cool.com" },
      ]);
      (deleteUrlList as jest.Mock).mockResolvedValue(undefined);

      await removeUrls(req, res, next);

      expect(getAllExistingUrls).toHaveBeenCalledWith({
        mode: "blacklist",
        values: ["cool.com"],
      });
      expect(deleteUrlList).toHaveBeenCalledWith({
        mode: "blacklist",
        values: ["cool.com"],
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        type: "url",
        mode: "blacklist",
        values: ["cool.com"],
        status: "success",
      });
    });

    test("should fail deleting URLs and return Bad Request", async () => {
      req.body = { values: ["cool.com", "uncool.com"], mode: "blacklist" };
      (getAllExistingUrls as jest.Mock).mockResolvedValue([
        { value: "cool.com" },
      ]);

      await removeUrls(req, res, next);

      expect(getAllExistingUrls).toHaveBeenCalledWith({
        values: ["cool.com", "uncool.com"],
        mode: "blacklist",
      });

      expect(deleteUrlList).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "One or more URLs not found in the database",
      });
    });
  });
});
