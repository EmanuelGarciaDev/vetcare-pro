import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: "vetcare-pro",
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user }) {
      // Make emanueldario.dev@gmail.com an admin automatically
      if (user.email === 'emanueldario.dev@gmail.com') {
        console.log('Master admin signing in:', user.email);
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user && user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: user.id,
            role: user.email === 'emanueldario.dev@gmail.com' ? 'Admin' : 'Customer'
          }
        };
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  debug: process.env.NODE_ENV === 'development'
};

export default authOptions;