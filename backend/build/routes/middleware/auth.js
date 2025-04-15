import jwt from "jsonwebtoken";
import { accDb, jwtSecret } from "../../app.js";
export const auth = (req, res, next) => {
    isAuthenticated(req, res, next).then(((result) => {
        if (result) {
            req.token = result;
            next();
        }
    })).catch((err) => console.log(err));
};
export default auth;
async function isAuthenticated(req, res, next) {
    if ("token" in req.cookies) {
        const token = req.cookies["token"];
        if (typeof (token) === 'string') {
            return await authHandler(token, res);
        }
        else {
            res.status(401).json({ error: "Invalid token given in cookies." });
        }
    }
    else if ("token" in req.headers) {
        const token = req.cookies["token"];
        if (typeof (token) === 'string') {
            return await authHandler(token, res);
        }
        else {
            res.status(401).json({ error: "Invalid token given in headers." });
        }
    }
    return undefined;
}
async function authHandler(token, res) {
    const decode = jwt.verify(token, jwtSecret);
    if (typeof (decode) === 'string') {
        const checkUsername = await accDb.checkUsername(decode);
        if (checkUsername) {
            return token;
        }
        else {
            res.status(401).json({ error: "Invalid token id." });
        }
    }
    else {
        res.status(401).json({ error: "Invalid JWT token supplied." });
    }
    return undefined;
}
