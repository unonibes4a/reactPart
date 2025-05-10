import { useState, useEffect, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ArrowLeft, ArrowRight, Download, Printer, FileText } from 'lucide-react';

export default function DataTable({ dataPath }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [columns, setColumns] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
     
        if (dataPath) {
          try {
            const response = await fetch(dataPath);
            
            if (!response.ok) {
              throw new Error(`Error al cargar los datos: ${response.status}`);
            }
            
            const jsonData = await response.json();
            processData(jsonData);
            setLoading(false);
            return;
          } catch (fetchError) {
            console.error("Error al cargar datos externos:", fetchError);
          
          }
        }
  
 
        const sampleData = Array(50).fill().map((_, index) => ({
          id: index + 1,
          nombre: `Producto ${index + 1}`,
          precio: Math.floor(Math.random() * 1000) + 10,
          categoria: ['Electrónica', 'Ropa', 'Hogar', 'Alimentos'][Math.floor(Math.random() * 4)],
          stock: Math.floor(Math.random() * 100),
          fecha: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString(),
          esColumna: {
            id: true,
            nombre: true,
            precio: true,
            categoria: true,
            stock: index % 3 !== 0,
            fecha: true,
            esColumna: false
          }
        }));
        
        processData(sampleData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dataPath]);
  
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
    const headers = columns.map(col => col.label).join(',');
    const rows = filteredAndSortedData.map(item => 
      columns.map(col => `"${item[col.key]}"`).join(',')
    ).join('\n');
    
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
        @media print {
          button { display: none; }
        }
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
            ${columns.map(col => `<th>${col.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${filteredAndSortedData.map(row => `
            <tr>
              ${columns.map(col => `<td>${row[col.key]}</td>`).join('')}
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
        @media print {
          body { background-color: white; }
          .pdf-container { box-shadow: none; padding: 0; }
          button { display: none; }
        }
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
              ${columns.map(col => `<th>${col.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${filteredAndSortedData.map(row => `
              <tr>
                ${columns.map(col => `<td>${row[col.key]}</td>`).join('')}
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
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Cargando datos...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-md text-red-800">
        Error: {error}
      </div>
    );
  }
  
  return (
    <div className="w-full overflow-hidden">
      <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <Search size={18} className="absolute left-3 text-gray-400" />
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={itemsPerPage} 
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5 por página</option>
            <option value={10}>10 por página</option>
            <option value={25}>25 por página</option>
            <option value={50}>50 por página</option>
          </select>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
            >
              <Download size={16} />
              <span>CSV</span>
            </button>
            
            <button 
              onClick={exportToPDF}
              className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
            >
              <FileText size={16} />
              <span>PDF</span>
            </button>
            
            <button 
              onClick={printTable}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
            >
              <Printer size={16} />
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse table-auto">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b"
                >
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col ml-1">
                        <ChevronUp 
                          size={12} 
                          className={`${sortConfig.key === column.key && sortConfig.direction === 'asc' 
                            ? 'text-blue-600' 
                            : 'text-gray-400'}`}
                        />
                        <ChevronDown 
                          size={12} 
                          className={`${sortConfig.key === column.key && sortConfig.direction === 'desc' 
                            ? 'text-blue-600' 
                            : 'text-gray-400'}`}
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
                  className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-2 border-b text-sm">
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No se encontraron datos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Mostrando {Math.min(filteredAndSortedData.length, (currentPage - 1) * itemsPerPage + 1)}-
            {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} de {filteredAndSortedData.length} registros
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
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
                  className={`w-8 h-8 flex items-center justify-center rounded-md ${
                    currentPage === pageNum 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-1 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}