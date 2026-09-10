export const popoverCss = `
.acs2-help-btn {
    position: relative;
    overflow: visible;
}

.help-popover {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 280px;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 20;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s;
    text-align: left;
    cursor: default;
}

.acs2-help-btn:hover .help-popover {
    opacity: 1;
    visibility: visible;
}

.help-popover strong {
    display: block;
    color: #0f172a;
    font-size: 0.85rem;
    margin-bottom: 6px;
}

.help-popover p {
    color: #475569;
    font-size: 0.75rem;
    line-height: 1.4;
    margin: 0;
    font-weight: normal;
}
`;
