import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from './mongodb';
import { UserModel } from './models/User';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }        try {
          await connectDB();
          const user = await UserModel.findOne({ email: credentials.email });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt', // Use JWT sessions instead of database sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },callbacks: {    async signIn({ user, account }) {
      console.log('SignIn callback - User:', user.email, 'Account:', account?.provider);
      // Make emanueldario.dev@gmail.com an admin automatically
      if (user.email === 'emanueldario.dev@gmail.com') {
        console.log('Master admin signing in:', user.email);
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback - URL:', url, 'BaseURL:', baseUrl);
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl + '/dashboard';
    },    async jwt({ token, user }) {
      console.log('JWT callback - Token sub:', token.sub, 'User:', user?.email);
      if (user) {
        token.id = user.id;
        token.role = user.email === 'emanueldario.dev@gmail.com' ? 'Admin' : 'Customer';
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback - Token:', token.sub, 'Session user:', session.user?.email);
      if (session.user && token) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub,
            role: token.role as string || 'Customer'
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