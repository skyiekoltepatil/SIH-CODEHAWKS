import { schemesData } from '../data';

export default function Schemes() {
    return (
        <section className="page active">
            <div className="page-container">
                <div className="page-header">
                    <h2>Government Schemes</h2>
                    <p>Discover and apply for eligible government schemes based on your profile.</p>
                </div>
                
                <div className="search-bar">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input type="text" placeholder="Search schemes by name, category, or keyword..." />
                    <button className="filter-btn"><i className="fa-solid fa-filter"></i> Filter</button>
                </div>

                <div className="schemes-grid">
                    {schemesData.map(scheme => (
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
                                    <button className="btn-outline">View Details</button>
                                    <button className="btn-primary">Apply Now</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
