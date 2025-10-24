import { NextAuthOptions } from "next-auth";
import CredentialsProviders from "next-auth/providers/credentials";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  accessToken?: string;
  refreshToken?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProviders({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "text" },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials?.email && !credentials?.password) return null;
        try {
          // when the user wants to log in
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
              credentials: "include",
            }
          );

          console.log("Response status: ", res);

          const data = await res.json();

          if (!res.ok) {
            const text = await res.text();
            console.log("Login failed response text: ", text);
            return null;
          }

          const user = data.currentUser;

          console.log(
            "Access Token",
            data.accessToken,
            "Refresh Token",
            data.refreshToken
          );

          console.log("User from backend: ", user);

          if (!user?.id || !user.email) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
        } catch (error) {
          console.error("Auth error: ", error);
          return null;
        }
      },
    }),
  ],

  // instead of storing session in DB, we are using JSON Web Token to keep the session state
  // our token from backend will be stored in cookies
  session: {
    strategy: "jwt",
  },

  callbacks: {
    // token - the spring generated token
    // account - credentials and oAuth info
    // user - basic profile from provider or authorize
    // profile - full profile data from provider

    // handles authentication
    async jwt({ token, user }) {
      // how the frontend will send the spring jwt via nextauth so the whole chain is working

      // if user is already logged via Credentials (Spring boot login)
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },

    // handles the session so that you can your backend from any page
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        role: token.role as string,
      };
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
