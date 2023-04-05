import prisma from "@/lib/prisma";
import { User } from "@prisma/client";
import NextAuth, { Session } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export default NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
      authorization: {
        params: { scope: "identify" },
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60, // 1 hour
  },
  callbacks: {
    async session({ session, user }) {
      if (!session.user) return session;

      if (session.user.name) {
        let existingUser = await prisma.user.findFirst({
          where: {
            name: session.user.name,
          },
        });

        if (existingUser) {
          (session as Session).user = existingUser;
        }
      }

      return session;
    },

    async signIn({ user, account, profile }) {
      if (!account || !profile) return false;

      const discordId = profile.id;
      if (profile.username && profile.discriminator) {
        user.name = `${profile.username}#${profile.discriminator}`;
      }

      let existingUser = await prisma.user.findFirst({
        where: {
          discordId: discordId,
        },
      });
      if (!existingUser) {
        await prisma.user.create({
          data: {
            discordId: discordId,
            name: user.name as string,
            image: profile.image_url,
          },
        });
      } else {
        await prisma.user.update({
          data: {
            name: user.name as string,
            image: profile.image_url,
          },
          where: {
            id: existingUser?.id,
          },
        });
      }

      return true;
    },
  },

});
