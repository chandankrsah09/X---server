import JWT from "jsonwebtoken";
import { User } from "@prisma/client";

const JWT_SECRETE = "$badman@123.";

class JWTService {
  public static generateTokenForUser(user: User) {
    const payload = {
      id: user?.id,
      email: user?.email,
    };
    const token = JWT.sign(payload, JWT_SECRETE);
    return token;
  }
}

export default JWTService;
