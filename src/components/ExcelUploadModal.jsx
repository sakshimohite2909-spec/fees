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
        const arrayData = evt.target.result;
        const wb = XLSX.read(arrayData, { type: 'array' });

        if (!wb.SheetNames || wb.SheetNames.length === 0) {
          setError('The uploaded Excel file contains no worksheets.');
          setIsProcessing(false);
          return;
        }

        let allNormalizedStudents = [];

        // Loop over ALL worksheets in the Excel file (e.g. POLY, PHARMACY tabs)
        wb.SheetNames.forEach((wsname) => {
          const ws = wb.Sheets[wsname];
          if (!ws || !ws['!ref']) return;

          // Detect header row index for this worksheet
          let headerRowIndex = 0;
          let sheetTitleText = '';
          const range = XLSX.utils.decode_range(ws['!ref']);

          for (let R = range.s.r; R <= range.e.r; R++) {
            let rowHasHeader = false;
            for (let C = range.s.c; C <= range.e.c; C++) {
              const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
              const cell = ws[cellAddress];
              if (cell && cell.v) {
                const val = String(cell.v).toUpperCase();
                sheetTitleText += ' ' + val;
                if (
                  val.includes('ENROL') || 
                  val.includes('ENROLMENT') || 
                  val.includes('ENROLLMENT') || 
                  val.includes('CANDIDATE') ||
                  val.includes('NAME') || 
                  val.includes('SRNO') || 
                  val.includes('SR NO') ||
                  val.includes('PRN') ||
                  val.includes('SCHEME')
                ) {
                  rowHasHeader = true;
                }
              }
            }
            if (rowHasHeader) {
              headerRowIndex = R;
              break;
            }
          }

          const rawRows = XLSX.utils.sheet_to_json(ws, { range: headerRowIndex });

          if (rawRows && rawRows.length > 0) {
            const normalizedSheetRows = rawRows.map((row) => {
              // Fuzzy key matcher to handle spaces, dots, case differences, and aliases (2-Pass: Exact first, then Fuzzy)
              const getVal = (...keys) => {
                const rowKeys = Object.keys(row);
                // Pass 1: Exact key matches
                for (const target of keys) {
                  const cleanTarget = String(target).toLowerCase().replace(/[^a-z0-9]/g, '');
                  for (const key of rowKeys) {
                    const cleanKey = String(key).toLowerCase().replace(/[^a-z0-9]/g, '');
                    if (cleanKey === cleanTarget) {
                      const val = row[key];
                      if (val !== undefined && val !== null && String(val).trim() !== '') {
                        return String(val).trim();
                      }
                    }
                  }
                }
                // Pass 2: Partial matches
                for (const target of keys) {
                  const cleanTarget = String(target).toLowerCase().replace(/[^a-z0-9]/g, '');
                  for (const key of rowKeys) {
                    const cleanKey = String(key).toLowerCase().replace(/[^a-z0-9]/g, '');
                    if (cleanTarget.length >= 4 && (cleanKey.includes(cleanTarget) || cleanTarget.includes(cleanKey))) {
                      const val = row[key];
                      if (val !== undefined && val !== null && String(val).trim() !== '') {
                        return String(val).trim();
                      }
                    }
                  }
                }
                return '';
              };

              let rawName = getVal(
                'candidatename', 'nameofcandidate', 'studentname', 'nameofstudent', 
                'fullname', 'name', 'candidate'
              );
              if (!rawName || rawName.toLowerCase() === 'candidate name' || rawName.toLowerCase() === 'student name' || rawName.toLowerCase() === 'name') {
                rawName = '';
              }
              const fullName = rawName || 'Student';

              const prnNo = getVal(
                'enrollno', 'enrolmentno', 'enrolment', 'enrollment', 'prnno', 'prn', 'rollno'
              ) || `2026${Math.floor(10000000 + Math.random() * 90000000)}`;

              const rollNo = getVal(
                'srno', 'sr', 'rollno', 'rn'
              ) || `RN-${Math.floor(100 + Math.random() * 900)}`;

              const schemeVal = getVal('scheme', 'course', 'academiccourse');
              const year = getVal('year') || '2nd Year';
              const mobile = getVal('mobile', 'phone', 'contact') || 'N/A';
              const email = getVal('gmail', 'email') || `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`;

              // Auto-determine Course (Polytechnic vs Pharmacy)
              let detectedCourse = 'Polytechnic';
              const sheetUpper = wsname.toUpperCase();
              const schemeUpper = schemeVal.toUpperCase();

              if (sheetUpper.includes('POLY') || sheetUpper.includes('DIPLOMA') || sheetTitleText.includes('POLYTECHNIC')) {
                detectedCourse = 'Polytechnic';
              } else if (sheetUpper.includes('PHARM') || sheetTitleText.includes('PHARMACY') || schemeUpper.startsWith('PH')) {
                detectedCourse = 'Pharmacy';
              } else if (schemeUpper.startsWith('CE') || schemeUpper.startsWith('ME') || schemeUpper.startsWith('EE') || schemeUpper.startsWith('CO') || schemeUpper.startsWith('EJ') || schemeUpper.includes('POLY')) {
                detectedCourse = 'Polytechnic';
              } else if (schemeVal === 'Polytechnic' || schemeVal === 'Pharmacy') {
                detectedCourse = schemeVal;
              }

              const branch = getVal('branch', 'department') || (detectedCourse === 'Engineering' ? 'Computer Engineering' : 'N/A');
              const displayScheme = schemeVal || (detectedCourse === 'Pharmacy' ? 'PH-2-J' : 'CE-K');

              return {
                fullName,
                prnNo,
                rollNo,
                course: detectedCourse,
                scheme: displayScheme,
                year,
                branch,
                mobile,
                email
              };
            });

            // Filter out empty header rows or invalid title rows
            const validStudents = normalizedSheetRows.filter(
              s => s.fullName && 
                   s.fullName !== 'Student' && 
                   s.fullName.toLowerCase() !== 'candidate name' && 
                   s.fullName.toLowerCase() !== 'name' &&
                   s.fullName.toLowerCase() !== 'student name'
            );
            allNormalizedStudents.push(...validStudents);
          }
        });

        if (allNormalizedStudents.length === 0) {
          setError('No valid student rows found in the uploaded Excel file.');
          setIsProcessing(false);
          return;
        }

        setParsedData(allNormalizedStudents);
        setIsProcessing(false);
      } catch (err) {
        console.error('Error reading Excel:', err);
        setError('Failed to parse Excel file. Please ensure it is a valid .xlsx or .csv file.');
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDownloadSample = () => {
    const titleRow = ["NETAJI SUBHASHCHANDRA BOSE EDUCATION TRUST'S NETAJI POLYTECHNIC COLLEGE"];
    const headerRow = ["SRNO", "ENROLMENTNO", "NAME", "SCHEME", "Year", "BRANCH", "MOBILE", "GMAIL ID"];

    const sampleRows = [
      [1, '20240325001192', 'Sakshi Patil', 'Engineering', '3rd Year', 'Computer Engineering', '9876543210', 'sakshpatil@gmail.com'],
      [2, '20240325001144', 'Rahul Deshmukh', 'Engineering', '3rd Year', 'Information Technology', '9822114455', 'rahul.deshmukh@gmail.com'],
      [3, '20240325001188', 'Anita Shinde', 'Polytechnic', '2nd Year', 'N/A', '9988776655', 'anita.shinde@gmail.com']
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([titleRow, [], headerRow, ...sampleRows]);
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }
    ];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden my-auto">

        {/* Top Header */}
        <div className="bg-slate-50 p-5 text-slate-900 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Upload Excel Student Sheet</h2>
              <p className="text-slate-500 text-xs mt-0.5 font-medium">Bulk import Name, Mobile Number, PRN No & Branch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 p-2 rounded-full transition-colors border border-slate-200 cursor-pointer"
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
                      <th className="py-2.5 px-3">SRNO</th>
                      <th className="py-2.5 px-3">ENROLMENTNO</th>
                      <th className="py-2.5 px-3">NAME</th>
                      <th className="py-2.5 px-3">SCHEME</th>
                      <th className="py-2.5 px-3">Year</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {parsedData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-purple-50/40">
                        <td className="py-2 px-3 font-mono font-bold text-slate-700">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-purple-700">{row.prnNo}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{row.fullName}</td>
                        <td className="py-2 px-3 font-semibold text-purple-800">{row.scheme || row.course}</td>
                        <td className="py-2 px-3 text-slate-700">{row.year || '3rd Year'}</td>
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
