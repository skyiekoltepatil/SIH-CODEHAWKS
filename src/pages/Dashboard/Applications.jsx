import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { applicationsData } from '../../data';

export default function Applications() {
    const location = useLocation();
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        if (location.state?.filter) {
            setFilter(location.state.filter);
        }
    }, [location.state]);

    const displayedApplications = filter === 'All' 
        ? applicationsData 
        : applicationsData.filter(app => app.status === filter);

    return (
        <div className="tab-content active" id="applications">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Schemes Applied & Details {filter !== 'All' ? `(${filter})` : ''}</h3>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}>
                    <option value="All">All Applications</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>
            <div className="applications-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {displayedApplications.map(app => {
                    let badgeClass = 'badge-outline';
                    if (app.status === 'Approved') badgeClass = 'badge-success';
                    if (app.status === 'Pending') badgeClass = 'badge-warning';
                    if (app.status === 'Rejected') badgeClass = 'badge-danger';
                    
                    return (
                        <div className="scheme-card" key={app.id}>
                            <div className="scheme-info">
                                <div className="scheme-details">
                                    <h4>{app.schemeName || app.name}</h4>
                                    <p>Application ID: <strong>{app.id}</strong> | Date: {app.dateApplied || app.date}</p>
                                    <div className="badges" style={{ marginTop: '0.5rem' }}>
                                        <span className={`badge ${badgeClass}`}>{app.status}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="btn-outline">View Details</button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
