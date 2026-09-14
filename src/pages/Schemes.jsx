import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { schemesData } from '../data';

export default function Schemes() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSchemes = schemesData.filter(scheme => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            scheme.name.toLowerCase().includes(term) ||
            scheme.category.toLowerCase().includes(term) ||
            scheme.description.toLowerCase().includes(term) ||
            scheme.tags.some(tag => tag.toLowerCase().includes(term))
        );
    });

    return (
        <section className="page active">
            <div className="page-container">
                <div className="page-header">
                    <h2>Government Schemes</h2>
                    <p>Discover and apply for eligible government schemes based on your profile.</p>
                </div>
                
                <div className="search-bar">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input 
                        type="text" 
                        placeholder="Search schemes by name, category, or keyword..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="schemes-grid">
                    {filteredSchemes.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>
                            No schemes match your search criteria.
                        </div>
                    ) : (
                        filteredSchemes.map(scheme => (
                            <div className="scheme-card" key={scheme.id}>
                                <div className="scheme-icon"><i className={`fa-solid ${scheme.icon}`}></i></div>
                                <div className="scheme-content">
                                    <span className="scheme-category">{scheme.category}</span>
                                    <h4>{scheme.name}</h4>
                                    <p>{scheme.description}</p>
                                    <div className="scheme-meta">
                                        <span className="department"><i className="fa-regular fa-building"></i> {scheme.department}</span>
                                    </div>
                                    <div className="scheme-tags">
                                        {scheme.tags.map((tag, idx) => <span key={idx} className="tag">{tag}</span>)}
                                    </div>
                                    <div className="scheme-actions">
                                        <button className="btn-outline" onClick={() => navigate(`/schemes/${scheme.id}`)}>View Details</button>
                                        <button className="btn-primary" onClick={() => navigate(`/dashboard/apply/${scheme.id}`)}>Apply Now</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
