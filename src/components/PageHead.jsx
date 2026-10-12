import { Link } from "react-router-dom";
import Icon from "./icons.jsx";

export default function PageHead({ crumb, title, sub, right }) {
 return (
 <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
 <div>
 <nav className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-ink-400 dark:text-ink-500 " aria-label="Breadcrumb">
 <Link to="/dashboard" className="hover:text-ink-700 dark:text-ink-300 ">Dashboard</Link>
 <Icon name="chevron" className="h-3 w-3" />
 <span className="text-ink-700 dark:text-ink-300 ">{crumb}</span>
 </nav>
 <h1 className="text-[26px] font-bold leading-tight tracking-tight text-ink-900 dark:text-white ">{title}</h1>
 {sub && <p className="mt-1 max-w-2xl text-[13.5px] text-ink-400 dark:text-ink-500 ">{sub}</p>}
 </div>
 {right}
 </div>
 );
}
