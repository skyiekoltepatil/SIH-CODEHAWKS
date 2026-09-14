export const helpModalCss = `
.help-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: flex-end;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
}

.help-drawer-content {
    background: white;
    width: 400px;
    height: 100%;
    padding: 24px;
    box-shadow: -4px 0 15px rgba(0, 0, 0, 0.1);
    animation: slideInRight 0.3s ease-out;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.help-drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e2e8f0;
}

.help-drawer-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #0f172a;
}

.help-drawer-header button {
    background: transparent;
    border: none;
    font-size: 1.2rem;
    color: #64748b;
    cursor: pointer;
}

.help-drawer-body h4 {
    margin: 0 0 8px 0;
    font-size: 0.95rem;
    color: #0f172a;
}

.help-drawer-body p {
    font-size: 0.85rem;
    color: #475569;
    line-height: 1.5;
    margin-bottom: 20px;
    font-style: italic;
    background: #f8fafc;
    padding: 12px;
    border-left: 3px solid #3b82f6;
    border-radius: 4px;
}

.help-drawer-body ul {
    list-style: none;
    padding: 0;
    margin: 0 0 24px 0;
}

.help-drawer-body ul li {
    font-size: 0.85rem;
    color: #334155;
    margin-bottom: 12px;
    line-height: 1.4;
    display: flex;
    gap: 8px;
}

.help-drawer-body ul li i {
    color: #3b82f6;
    margin-top: 3px;
}

@keyframes slideInRight {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
`;
