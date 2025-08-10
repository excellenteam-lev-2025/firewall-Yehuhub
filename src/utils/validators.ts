const modes = ["blacklist", "whitelist"];

const IP_REGEX =
  /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

const DOMAIN_REGEX = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/;

export const validateIp = (ip: string): Boolean => {
  return IP_REGEX.test(ip);
};

export const validateUrl = (url: string): Boolean => {
  return DOMAIN_REGEX.test(url);
};

export const validateMode = (mode: string): Boolean => {
  if (!mode) {
    return false;
  }
  return modes.includes(mode.toLowerCase());
};

export const validatePort = (port: number): Boolean => {
  return 1 <= port && port <= 65535;
};
