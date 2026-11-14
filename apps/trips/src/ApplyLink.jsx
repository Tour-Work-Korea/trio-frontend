import React from 'react';
import {loginHref} from './authModel.js';
export function ApplyLink({id, children, className}) {
  const back =
    window.location.pathname + window.location.search + window.location.hash;
  return (
    <a className={className} href={loginHref({id, back})}>
      {children}
    </a>
  );
}
