import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/',
    component: ComponentCreator('/', '152'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', 'eb2'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', '42a'),
            routes: [
              {
                path: '/architecture/api-architecture',
                component: ComponentCreator('/architecture/api-architecture', 'a06'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/architecture/backend-packages',
                component: ComponentCreator('/architecture/backend-packages', '5ad'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/architecture/frontend-architecture',
                component: ComponentCreator('/architecture/frontend-architecture', 'd10'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/architecture/overview',
                component: ComponentCreator('/architecture/overview', 'f3c'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/deployment/tier-1-cheap',
                component: ComponentCreator('/deployment/tier-1-cheap', '19c'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/deployment/tier-2-production',
                component: ComponentCreator('/deployment/tier-2-production', 'ac0'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/getting-started/installation',
                component: ComponentCreator('/getting-started/installation', 'e0c'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/getting-started/project-structure',
                component: ComponentCreator('/getting-started/project-structure', '508'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/',
                component: ComponentCreator('/', '7da'),
                exact: true,
                sidebar: "docs"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
