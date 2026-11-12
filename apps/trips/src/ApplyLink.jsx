import React from 'react';
import {applicationUrl} from './applicationUrl.js';

// Authentication, signup and checkout continue on the existing production site.
export function ApplyLink({id, children, className}) {
  return <a className={className} href={applicationUrl(id)}>{children}</a>;
}
