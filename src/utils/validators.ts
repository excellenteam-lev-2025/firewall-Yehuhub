import validator from "validator";

export const validateIp = (ip: string): boolean => {
  return validator.isIP(ip, 4);
};

export const validateUrl = (url: string): boolean => {
  return validator.isFQDN(url, {
    require_tld: true,
    allow_underscores: false,
    allow_trailing_dot: false,
  });
};

export const validateMode = (mode: string): boolean => {
  if (!mode) {
    return false;
  }
  return ["blacklist", "whitelist"].includes(mode.toLowerCase());
};

export const validatePort = (port: number): boolean => {
  return validator.isPort(port.toString());
};
