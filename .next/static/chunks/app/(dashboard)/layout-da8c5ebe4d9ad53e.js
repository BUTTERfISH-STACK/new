(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[642],{95798:function(e,t,n){Promise.resolve().then(n.bind(n,41505))},41505:function(e,t,n){"use strict";n.r(t),n.d(t,{Sidebar:function(){return x}});var r=n(3827),a=n(8792),c=n(47907),i=n(1657),l=n(87461);/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,l.Z)("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]]),o=(0,l.Z)("Kanban",[["path",{d:"M6 5v11",key:"mdvv1e"}],["path",{d:"M12 5v6",key:"14ar3b"}],["path",{d:"M18 5v14",key:"7ji314"}]]);var u=n(80559),h=n(34059),d=n(65199);/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let f=(0,l.Z)("Activity",[["path",{d:"M22 12h-4l-3 9L9 3l-3 9H2",key:"d5dnw9"}]]);var y=n(29733);/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let m=(0,l.Z)("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]),p=[{href:"/",label:"Dashboard",icon:s},{href:"/pipeline",label:"Pipeline",icon:o},{href:"/companies",label:"Companies",icon:u.Z},{href:"/contacts",label:"Contacts",icon:h.Z},{href:"/tasks",label:"Tasks",icon:d.Z},{href:"/activities",label:"Activities",icon:f}];function x(){let e=(0,c.usePathname)();return(0,r.jsxs)("div",{className:"flex h-screen w-64 flex-col border-r bg-card",children:[(0,r.jsxs)("div",{className:"flex h-16 items-center gap-2 border-b px-6",children:[(0,r.jsx)(y.Z,{className:"h-6 w-6 text-primary"}),(0,r.jsx)("span",{className:"text-xl font-bold",children:"CRM"})]}),(0,r.jsx)("nav",{className:"flex-1 space-y-1 p-4",children:p.map(t=>{let n=e===t.href||"/"!==t.href&&e.startsWith(t.href);return(0,r.jsxs)(a.default,{href:t.href,className:(0,i.cn)("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",n?"bg-primary text-primary-foreground":"text-muted-foreground hover:bg-accent hover:text-accent-foreground"),children:[(0,r.jsx)(t.icon,{className:"h-5 w-5"}),t.label]},t.href)})}),(0,r.jsx)("div",{className:"border-t p-4",children:(0,r.jsxs)("button",{className:(0,i.cn)("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"),children:[(0,r.jsx)(m,{className:"h-5 w-5"}),"Settings"]})})]})}},1657:function(e,t,n){"use strict";n.d(t,{Qm:function(){return o},cn:function(){return c},p6:function(){return l},xG:function(){return i},zg:function(){return s}});var r=n(75504),a=n(51367);function c(){for(var e=arguments.length,t=Array(e),n=0;n<e;n++)t[n]=arguments[n];return(0,a.m6)((0,r.W)(t))}function i(e){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(e)}function l(e){return e?new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric"}).format(new Date(e)):"-"}function s(e){if(!e)return"-";let t=new Date,n=Math.ceil((new Date(e).getTime()-t.getTime())/864e5);return 0===n?"Today":1===n?"Tomorrow":-1===n?"Yesterday":n>0&&n<=7?"In ".concat(n," days"):n<0&&n>=-7?"".concat(Math.abs(n)," days ago"):l(e)}function o(e){return e.split(" ").map(e=>e[0]).join("").toUpperCase().slice(0,2)}},65199:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(87461).Z)("CheckSquare",[["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}],["path",{d:"M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",key:"1jnkn4"}]])},29733:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(87461).Z)("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]])},34059:function(e,t,n){"use strict";n.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.330.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,n(87461).Z)("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]])}},function(e){e.O(0,[700,746,971,69,744],function(){return e(e.s=95798)}),_N_E=e.O()}]);