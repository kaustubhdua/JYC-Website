import React,{useLayoutEffect} from 'react';
import {useLocation} from 'react-router-dom';

const PAGE_NAMES={'/':'JYC','/about':'About','/clubs':'Communities','/events':'Events','/gallery':'Moments','/archive':'Archive','/team':'People','/contact':'Contact','/history':'History'};
export function JYCEditorialSystem({children}){
 const loc=useLocation();
 const clean=loc.pathname.replace(/\/$/,'')||'/';
 const page=PAGE_NAMES[clean]||(clean.startsWith('/clubs/')?'Community':clean.startsWith('/events/')?'Event':clean.startsWith('/gallery/')?'Moment':'JYC');
 useLayoutEffect(()=>{
   document.documentElement.dataset.jycRoute=clean;
   document.documentElement.dataset.jycPage=page.toLowerCase().replace(/\s+/g,'-');
   window.scrollTo?.({top:0,behavior:'auto'});
   return()=>{delete document.documentElement.dataset.jycRoute;delete document.documentElement.dataset.jycPage};
 },[clean,page]);
 return <><div className="jyc-route-transition" aria-hidden="true"/>{children}</>;
}
