export const INVALID_IP = "Unknown";
export const add_ip = (req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (ip === undefined || typeof (ip) === "object") {
        ip = INVALID_IP;
    }
    req.verifiedIp = ip;
    next();
};
