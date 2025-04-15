import express from "express";

export const INVALID_IP = "Unknown";
export const add_ip = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (ip === undefined || typeof(ip) === "object") {
        ip = INVALID_IP;
    }

    req.verifiedIp = ip;
    next();
};