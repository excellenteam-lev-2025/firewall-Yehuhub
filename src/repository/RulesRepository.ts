import { UpdateAllInput } from "../schemas/UpdateListSchema";
import { getDb } from "../services/DbService";
import { updateUrls } from "./UrlRepository";
import { updatePorts } from "./PortRepository";
import { updateIps } from "./IpRepository";

const db = getDb();

export const toggleStatus = async (data: UpdateAllInput) => {
  const { urls, ports, ips } = data;
  return await db.transaction(async (tx) => {
    const updatedUrls = await updateUrls(urls, tx);
    const updatedPorts = await updatePorts(ports, tx);
    const updatedIps = await updateIps(ips, tx);
    return { updatedUrls, updatedPorts, updatedIps };
  });
};
