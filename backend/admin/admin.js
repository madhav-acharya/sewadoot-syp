import AdminJS, { ComponentLoader } from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';
import User from '../models/user.js';
import Booking from '../models/Booking.js';
import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });
import session from 'express-session';
import express from 'express';
const router = express.Router();

AdminJS.registerAdapter(AdminJSMongoose);
const componentLoader = new ComponentLoader();
const dashboardComponent = componentLoader.add('Dashboard', './dashboard');

const adminJs = new AdminJS({
  resources: [
    {
      resource: User,
      options: {
        properties: {
          password: {
            isVisible: { list: false, edit: true, filter: false, show: false },
          },
          role: {
            isVisible: { list: true, edit: true, filter: true, show: true },
          },
        },
      },
    },
    {
      resource: Booking,
      options: {
        properties: {
          user: {
            reference: 'User',
            isVisible: { list: true, edit: true, filter: true, show: true },
          },
          status: {
            isVisible: { list: true, edit: true, filter: true, show: true },
          },
        },
      },
    },
  ],
  locale: 'en',
  version: '3.0.0',
  rootPath: '/admin',
  branding: {
    companyName: 'SewaDoot',
    softwareBrothers: false,
    withMadeWithLove: false,
    withDarkMode: true,
    withLogo: true,
    withResources: true,
    withIcons: true,
    withBackground: true,
    withDashboard: true,
    withCustomLogo: true,
    withCustomBranding: true,
    withCustomTheme: true,
    withCustomHeader: true,
    withCustomFooter: true,
    withCustomSidebar: true,
    withCustomMenu: true,
    withCustomRoutes: true,
    withCustomActions: true,
    withCustomComponents: true,
    withCustomStyles: true,
    withCustomScripts: true,
    withCustomTranslations: true,
    logo: 'https://res.cloudinary.com/dzeblqup4/image/upload/f_auto,q_auto/v1/sewadoot/qjvooenohdmwfjvo3ejo',
    theme: {
      colors: {
        primary100: '#1d3557',
        primary80: '#457b9d',
        primary60: '#a8dadc',
      },
    },
  },
  locale: 'en',
  translations: {
    en: {
      labels: {
        User: 'Users',
      },
      messages: {
        welcome: 'Welcome to the Admin Panel',
      },
    },
  },
  dashboard: {
    handler: async () => {
      console.log('Custom Dashboard Handler Executed');
      return {};
    },
    component: dashboardComponent,
  },
});

const ADMIN = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  };

  const sessionOptions = {
    secret: process.env.SESSION_SECRET ,
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  };
  
  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
    authenticate: async (email, password) => {
      if (email === ADMIN.email && password === ADMIN.password) {
        return { email };
      }
      return null;
    },
    cookieName: 'sewadoot',
    cookiePassword: 'cookieSecret',
  }, router, session(sessionOptions));

export { adminJs, adminRouter };
