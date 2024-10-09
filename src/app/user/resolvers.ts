import axios from "axios";
import { prismaClient } from "../../client/db";
import JWTService from "../../services/jwt";

interface GoogleTokenResult {
  family_name: string | null | undefined;
  iss?: string;
  nbf?: string;
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: boolean;
  azp?: string;
  name?: string;
  picture?: string;
  given_name: string;
  iat?: string;
  exp?: string;
  jti?: string;
  alg?: string;
  kid?: string;
  typ?: string;
}

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    try {
      const googleToken = token;
      const googleOauthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
      googleOauthURL.searchParams.set("id_token", googleToken);

      // Log the URL for debugging
      console.log("Google OAuth URL:", googleOauthURL.toString());

      const { data } = await axios.get<GoogleTokenResult>(
        googleOauthURL.toString(),
        {
          responseType: "json",
        }
      );

      // Log the response from Google
      console.log("Google Token Response:", data);

      // Ensure email exists
      if (!data.email) {
        throw new Error("Email not returned from Google OAuth");
      }

      // Check if user exists in the database
      let user = await prismaClient.user.findUnique({
        where: { email: data.email },
      });

      // If user doesn't exist, create a new one
      if (!user) {
        user = await prismaClient.user.create({
          data: {
            email: data.email,
            firstName: data.given_name,
            lastName: data.family_name,
            profileImageURL: data.picture,
          },
        });
      }

      const userInDb = await prismaClient.user.findUnique({
        where: { email: data.email },
      });

      if (!userInDb) throw new Error("User with email not found");

      // Generate JWT for the user
      const userToken = JWTService.generateTokenForUser(userInDb);

      return userToken;
    } catch (error: any) {
      // Log the actual error message
      console.error("Error verifying Google token:", error.response?.data || error.message);

      // Rethrow error with meaningful message
      throw new Error(`Failed to verify Google token: ${error.message}`);
    }
  },
};

export const resolvers = { queries };
