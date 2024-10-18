import JWT from "jsonwebtoken";
import { User } from "@prisma/client";
import { JWTUser } from "../app/interfaces";

const JWT_SECRETE = "$badman@123.";

class JWTService {
  public static generateTokenForUser(user: User) {
    const payload: JWTUser = {
      id: user?.id,
      email: user?.email,
    };
    const token = JWT.sign(payload, JWT_SECRETE);
    return token;
  }

  public static decodeToken(token: string) {
    try {
      return JWT.verify(token, JWT_SECRETE) as JWTUser;
    } catch (error) {
      return null;
    }
  }
}

export default JWTService;
