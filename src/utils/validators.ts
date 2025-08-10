export const validateIp = (ip: string): Boolean => {
  return /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/.test(
    ip
  );
};

export const validateUrl = (url: string): Boolean => {
  return /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/.test(url);
};

export const validateMode = (mode: string): Boolean => {
  if (!mode) {
    return false;
  }
  return ["blacklist", "whitelist"].includes(mode.toLowerCase());
};

export const validatePort = (port: number): Boolean => {
  return 1 <= port && port <= 65535;
};
