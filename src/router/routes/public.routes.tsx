import React from 'react';
import { RouteObject } from 'react-router-dom';
import { HomePage } from '../../pages/home/HomePage';
import { AboutPage } from '../../pages/about/AboutPage';
import { ContactPage } from '../../pages/contact/ContactPage';

export const publicRoutes: RouteObject[] = [
  {
    path: '',
    element: <HomePage />,
  },
  {
    path: 'about',
    element: <AboutPage />,
  },
  {
    path: 'contact',
    element: <ContactPage />,
  },
];
