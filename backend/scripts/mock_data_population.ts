import { faker } from "@faker-js/faker";
import { UrlInsertInput, urlInsertSchema } from "../src/schemas/UrlSchema";
import { ipTable, portTable, urlTable } from "../src/db/schema";
import { IpInsertInput, ipInsertSchema } from "../src/schemas/IpSchema";
import { PortInsertInput, portInsertSchema } from "../src/schemas/PortSchema";
import { db } from "../src/services/DbService";
import { config } from "../src/config/env";

const randomizeMode = (): string => {
  const options = [config.constants.blacklist, config.constants.whitelist];
  const randIndex = Math.floor(Math.random() * 2);
  return options[randIndex];
};

const randomizePortNumber = (): number => {
  return Math.floor(Math.random() * 65535) + 1;
};

const generateFakeUrl = (): UrlInsertInput => {
  return {
    mode: randomizeMode(),
    value: faker.internet.domainName(),
  };
};

const generateFakeIp = (): IpInsertInput => {
  return {
    mode: randomizeMode(),
    value: faker.internet.ipv4(),
  };
};

const generateFakePort = (): PortInsertInput => {
  return {
    mode: randomizeMode(),
    value: randomizePortNumber(),
  };
};

const generateUrls = async (amount: number = 10) => {
  const data: UrlInsertInput[] = [];

  for (let i = 0; i < amount; i++) {
    const url = generateFakeUrl();
    const parsed = urlInsertSchema.parse(url);
    data.push(parsed);
  }
  await db.insert(urlTable).values(data);
};

const generatePorts = async (amount: number = 10) => {
  const data: PortInsertInput[] = [];

  for (let i = 0; i < amount; i++) {
    const url = generateFakePort();
    const parsed = portInsertSchema.parse(url);
    data.push(parsed);
  }
  await db.insert(portTable).values(data);
};

const generateIps = async (amount: number = 10) => {
  const data: IpInsertInput[] = [];

  for (let i = 0; i < amount; i++) {
    const url = generateFakeIp();
    const parsed = ipInsertSchema.parse(url);
    data.push(parsed);
  }
  await db.insert(ipTable).values(data);
};

generateUrls();
generatePorts();
generateIps();
