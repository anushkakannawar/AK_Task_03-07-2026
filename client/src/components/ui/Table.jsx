import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../utils/theme';

const Table = ({ columns = [], data = [], isLoading = false, emptyMessage = 'No records found' }) => {
  const { isDark } = useTheme();
  const C = getColors(isDark);

  if (isLoading) {
    return (
      <div style={{ overflowX: 'auto' }}>
        <table className="dark-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{columns.map(col => <th key={col.key}>{col.header}</th>)}</tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key}>
                    <div style={{ height: '14px', background: C.border, borderRadius: '4px', width: `${55 + Math.random()*35}%`, opacity: 0.6 }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 24px', color: C.text4, fontSize: '0.85rem' }}>
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{ marginBottom: '10px', opacity: 0.4 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="dark-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>{columns.map(col => <th key={col.key} className={col.className || ''}>{col.header}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx}>
              {columns.map(col => (
                <td key={col.key} className={col.cellClassName || ''}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const Pagination = ({ pagination, onPageChange }) => {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: `1px solid ${C.border}`, fontSize: '0.78rem', color: C.text3 }}>
      <span>Showing {from}–{to} of {total}</span>
      <div style={{ display: 'flex', gap: '6px' }}>
        {[{ label: 'Previous', action: page-1, disabled: page<=1 }, { label: 'Next', action: page+1, disabled: page>=pages }].map(btn => (
          <button key={btn.label} onClick={() => onPageChange(btn.action)} disabled={btn.disabled}
            style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 500, background: btn.disabled ? 'transparent' : C.panel, border: `1px solid ${C.border}`, color: btn.disabled ? C.text4 : C.text3, cursor: btn.disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Table;
