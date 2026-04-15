/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ResetPasswordRequest = {
  properties: {
    token: {
      type: 'string',
      isRequired: true,
      minLength: 1,
    },
    password: {
      type: 'string',
      isRequired: true,
      minLength: 8,
    },
  },
} as const;
