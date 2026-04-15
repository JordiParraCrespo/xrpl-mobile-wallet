/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $RegisterRequest = {
  properties: {
    email: {
      type: 'string',
      isRequired: true,
      format: 'email',
    },
    password: {
      type: 'string',
      isRequired: true,
      minLength: 8,
    },
    firstName: {
      type: 'string',
      isRequired: true,
      minLength: 1,
    },
    lastName: {
      type: 'string',
      isRequired: true,
      minLength: 1,
    },
  },
} as const;
