import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  ArrowLeft, 
  ArrowRight, 
  Download, 
  Printer, 
  FileText,
  Edit,
  Trash2,
  Eye,
  Plus
} from 'lucide-react';
import './TableData.css';

export default function TableData({ 
  data: initialData = [],
  onView,
  onEdit,
  onDelete,
  onAdd,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [columns, setColumns] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const resetTable = () => {
    setData([]);

  };
  useEffect(() => {
    try {
      setLoading(true);
      if (initialData && initialData.length > 0) {
        processData(initialData);
      }else{
        resetTable()
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [initialData]);

  const processData = (rawData) => {
    if (rawData && rawData.length > 0) {
      setData(rawData);
      const firstItem = rawData[0];
      const columnsConfig = [];
      
      for (const key in firstItem) {
        const shouldShow = firstItem.esColumna && typeof firstItem.esColumna === 'object'
          ? firstItem.esColumna[key] !== false
          : key !== 'esColumna';
          
        if (shouldShow) {
          columnsConfig.push({
            key,
            label: key.charAt(0).toUpperCase() + key.slice(1),
            sortable: true
          });
        }
      }
      
  
      columnsConfig.push({
        key: 'actions',
        label: 'Acciones',
        sortable: false
      });
      
      setColumns(columnsConfig);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedData = useMemo(() => {
    let processedData = [...data];
    
    if (searchTerm) {
      processedData = processedData.filter(item => 
        Object.keys(item).some(key => 
          item[key] !== null && 
          item[key] !== undefined && 
          typeof item[key] !== 'object' && 
          String(item[key]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    if (sortConfig.key) {
      processedData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return processedData;
  }, [data, searchTerm, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const exportToCSV = () => {
    const headers = columns
      .filter(col => col.key !== 'actions' && !col.key.startsWith('obj_'))   
      .map(col => col.label)
      .join(',');
      
    const rows = filteredAndSortedData
      .map(item => 
        columns
          .filter(col => col.key !== 'actions' )   
          .map(col => `"${item[col.key]}"`)
          .join(',')
      )
      .join('\n');
      
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'table_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printTable = () => {
    const printWindow = window.open('', '_blank');
    const printStyles = `
      <style>
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        h2 { margin-bottom: 10px; }
        .print-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .print-date { text-align: right; }
        @media print { button { display: none; } }
      </style>
    `;

    const tableContent = `
      <div class="print-header">
        <h2>Reporte de Datos</h2>
        <div class="print-date">Fecha: ${new Date().toLocaleDateString()}</div>
      </div>
      <table>
        <thead>
          <tr>
            ${columns
              .filter(col => col.key !== 'actions')   
              .map(col => `<th>${col.label}</th>`)
              .join('')}
          </tr>
        </thead>
        <tbody>
          ${filteredAndSortedData.map(row => `
            <tr>
              ${columns
                .filter(col => col.key !== 'actions')  
                .map(col => `<td>${row[col.key]}</td>`)
                .join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div>
        <p>Total de registros: ${filteredAndSortedData.length}</p>
      </div>
      <button onclick="window.print(); window.close();">Imprimir</button>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Imprimir Tabla</title>
        ${printStyles}
      </head>
      <body>
        ${tableContent}
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    const pdfStyles = `
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
        .pdf-container { background-color: white; padding: 20px; max-width: 800px; margin: 0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        h2 { color: #333; margin-bottom: 10px; }
        .pdf-header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .pdf-date { text-align: right; }
        .pdf-footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
        @media print { body { background-color: white; } .pdf-container { box-shadow: none; padding: 0; } button { display: none; } }
      </style>
    `;

    const tableContent = `
      <div class="pdf-container">
        <div class="pdf-header">
          <h2>Reporte de Datos</h2>
          <div class="pdf-date">Fecha: ${new Date().toLocaleDateString()}</div>
        </div>
        <table>
          <thead>
            <tr>
              ${columns
                .filter(col => col.key !== 'actions')  
                .map(col => `<th>${col.label}</th>`)
                .join('')}
            </tr>
          </thead>
          <tbody>
            ${filteredAndSortedData.map(row => `
              <tr>
                ${columns
                  .filter(col => col.key !== 'actions')   
                  .map(col => `<td>${row[col.key]}</td>`)
                  .join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div>
          <p>Total de registros: ${filteredAndSortedData.length}</p>
        </div>
        <div class="pdf-footer">
          <p>Documento generado automáticamente</p>
        </div>
        <button onclick="window.print(); window.close();">Imprimir PDF</button>
      </div>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Exportar a PDF</title>
        ${pdfStyles}
      </head>
      <body>
        ${tableContent}
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Cargando datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="controls-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <Search size={18} className="search-icon" />
        </div>
        <div className="actions-container">
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="items-per-page"
          >
            <option value={5}>5 por página</option>
            <option value={10}>10 por página</option>
            <option value={25}>25 por página</option>
            <option value={50}>50 por página</option>
          </select>
          
          <button onClick={exportToCSV} className="action-button btn-csv">
            <Download size={16} />
            <span className="action-button-text">CSV</span>
          </button>
          
          <button onClick={exportToPDF} className="action-button btn-pdf">
            <FileText size={16} />
            <span className="action-button-text">PDF</span>
          </button>
          
          <button onClick={printTable} className="action-button btn-print">
            <Printer size={16} />
            <span className="action-button-text">Imprimir</span>
          </button>
          
          <button 
            onClick={() => onAdd && onAdd()} 
            className="action-button" 
            style={{ backgroundColor: '#10b9817c' }}
          >
            <Plus size={16} />
            <span className="action-button-text">Nuevo</span>
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead className="table-header">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="table-header-cell">
                  <div 
                    className="sort-button" 
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="sort-icons">
                        <ChevronUp
                          className={`sort-icon ${
                            sortConfig.key === column.key && sortConfig.direction === 'asc'
                              ? 'sort-active'
                              : ''
                          }`}
                        />
                        <ChevronDown
                          className={`sort-icon ${
                            sortConfig.key === column.key && sortConfig.direction === 'desc'
                              ? 'sort-active'
                              : ''
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={`table-row ${
                    rowIndex % 2 === 0 ? 'table-row-even' : 'table-row-odd'
                  }`}
                >
                  {columns.map((column) => {
                    if (column.key === 'actions') {
                      return (
                        <td key={column.key} className="table-cell crud-actions">
                          <div className="action-buttons">
                            <button 
                              className="crud-button view-button" 
                              onClick={() => onView && onView(row)}
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className="crud-button edit-button" 
                              onClick={() => onEdit && onEdit(row)}
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="crud-button delete-button" 
                              onClick={() => onDelete && onDelete(row)}
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      );
                    }
                    return (
                      <td key={column.key} className="table-cell">
                        {row[column.key]}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="empty-message">
                  No se encontraron datos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Mostrando {Math.min(filteredAndSortedData.length, (currentPage - 1) * itemsPerPage + 1)}-
            {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} de{' '}
            {filteredAndSortedData.length} registros
          </div>
          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`pagination-button ${
                currentPage === 1 ? 'pagination-button-disabled' : ''
              }`}
            >
              <ArrowLeft size={18} />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`pagination-button ${
                    currentPage === pageNum ? 'pagination-button-active' : ''
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`pagination-button ${
                currentPage === totalPages ? 'pagination-button-disabled' : ''
              }`}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}