import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function MainLayout() {
    return (
        <>
            <Navbar />
            <div id="app-container">
                <Outlet />
            </div>
        </>
    );
}
