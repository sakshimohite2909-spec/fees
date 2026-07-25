import React, { useState } from 'react';
import { X, FileSpreadsheet, Upload, Download, CheckCircle, AlertCircle, Table, ArrowRight } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ExcelUploadModal({ isOpen, onClose, onImportSuccess }) {
  const [parsedData, setParsedData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setError('');
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          setError('The uploaded Excel sheet contains no rows or data.');
          setIsProcessing(false);
          return;
        }

        // Normalize columns (support 'Name', 'Mobile Number', 'PRN No', 'Branch', etc.)
        const normalized = data.map((row) => {
          return {
            fullName: row.Name || row['Student Name'] || row.fullName || row['FULL NAME'] || 'Student',
            mobile: row['Mobile Number'] || row.Mobile || row.mobile || row.Phone || row['Contact Number'] || 'N/A',
            prnNo: row['PRN No'] || row.PRN || row.prnNo || row['PRN Number'] || 'N/A',
            branch: row.Branch || row.Department || row.branch || row.Course || 'Computer Engineering',
            rollNo: row['Roll No'] || row.RollNo || row.rollNo || `RN-${Math.floor(100 + Math.random() * 900)}`,
            email: row['Gmail ID'] || row.Email || row.email || `${(row.Name || row['Student Name'] || 'student').toLowerCase().replace(/\s+/g, '')}@gmail.com`
          };
        });

        setParsedData(normalized);
        setIsProcessing(false);
      } catch (err) {
        console.error('Error reading Excel:', err);
        setError('Failed to parse Excel file. Please ensure it is a valid .xlsx or .csv file.');
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleDownloadSample = () => {
    const sampleData = [
      {
        'Name': 'Sakshi Patil',
        'Mobile Number': '9876543210',
        'PRN No': '20240325001192',
        'Branch': 'Computer Engineering',
        'Roll No': 'CS2026-042',
        'Gmail ID': 'sakshpatil@gmail.com'
      },
      {
        'Name': 'Rahul Deshmukh',
        'Mobile Number': '9822114455',
        'PRN No': '20240325001144',
        'Branch': 'Information Technology',
        'Roll No': 'CS2026-015',
        'Gmail ID': 'rahul.deshmukh@gmail.com'
      },
      {
        'Name': 'Anita Shinde',
        'Mobile Number': '9988776655',
        'PRN No': '20240325001188',
        'Branch': 'Mechanical Engineering',
        'Roll No': 'ME2026-008',
        'Gmail ID': 'anita.shinde@gmail.com'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'Student_Data_Sample_Template.xlsx');
  };

  const handleConfirmImport = () => {
    if (parsedData.length === 0) return;
    onImportSuccess(parsedData);
    setParsedData([]);
    setFileName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 max-w-2xl w-full overflow-hidden soft-shadow">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-purple-800 via-violet-700 to-pink-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <FileSpreadsheet className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Upload Excel Student Sheet</h2>
              <p className="text-purple-100 text-xs mt-0.5">Bulk import Name, Mobile Number, PRN No & Branch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Sample Download Bar */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Table className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs font-bold text-purple-900">Need a sample Excel format?</p>
                <p className="text-[11px] text-purple-700">Download formatted template with Name, Mobile, PRN & Branch columns.</p>
              </div>
            </div>
            <button
              onClick={handleDownloadSample}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-purple-100 text-purple-700 font-extrabold text-xs shadow-sm border border-purple-200 transition-all shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* File Upload Zone */}
          {parsedData.length === 0 ? (
            <div className="border-2 border-dashed border-purple-200 rounded-3xl p-8 text-center bg-purple-50/20 hover:bg-purple-50/40 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-12 h-12 mx-auto text-purple-500 mb-3 animate-float" />
              <p className="text-sm font-black text-slate-800">Click to Select or Drag Excel / CSV File</p>
              <p className="text-xs text-slate-400 mt-1">Supports .xlsx, .xls and .csv formats</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Loaded: <span className="font-extrabold">{fileName}</span> ({parsedData.length} records parsed)
                </span>
                <button
                  onClick={() => { setParsedData([]); setFileName(''); }}
                  className="text-emerald-700 hover:underline font-bold"
                >
                  Change File
                </button>
              </div>

              {/* Table Preview */}
              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-purple-50 text-purple-900 font-bold uppercase sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Mobile Number</th>
                      <th className="py-2.5 px-3">PRN No</th>
                      <th className="py-2.5 px-3">Branch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {parsedData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-purple-50/40">
                        <td className="py-2 px-3 font-bold text-slate-900">{row.fullName}</td>
                        <td className="py-2 px-3 font-mono text-slate-700">{row.mobile}</td>
                        <td className="py-2 px-3 font-mono font-bold text-purple-700">{row.prnNo}</td>
                        <td className="py-2 px-3 text-slate-800">{row.branch}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>

            {parsedData.length > 0 && (
              <button
                type="button"
                onClick={handleConfirmImport}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-800 hover:to-pink-700 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all shimmer-btn"
              >
                <span>Import {parsedData.length} Students to Database</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
