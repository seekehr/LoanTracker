export { };
declare global {
  namespace Express {
    interface Request {
      verifiedIp?: string | undefined;
      token?: string | undefined;
    }
  }
}