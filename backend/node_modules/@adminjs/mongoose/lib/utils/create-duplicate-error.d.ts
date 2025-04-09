import { ValidationError } from 'adminjs';
declare const createDuplicateError: ({ keyValue: duplicateEntry, errmsg }: {
    keyValue: any;
    errmsg: any;
}, document: any) => ValidationError;
export { createDuplicateError };
