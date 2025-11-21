
import React from 'react';
import { FileDown, ArrowLeft, CheckCircle, User, FileText } from 'lucide-react';
import { CompilationResult } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PreviewProps {
  result: CompilationResult;
  onBack: () => void;
}

const Preview: React.FC<PreviewProps> = ({ result, onBack }) => {
  
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    
    // Use "Times" font for the PDF to match the theme
    doc.setFont("times", "bold"); 
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("Rapport d'Extraction de Données", margin, 20);
    
    doc.setFont("times", "normal");
    
    let yPosition = 35;

    result.analyses.forEach((item, index) => {
        // Check if we need a new page for the next table
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }

        // Document Header in PDF
        doc.setFontSize(12);
        doc.setFont("times", "bold"); // Times Bold
        doc.setTextColor(79, 70, 229); // Indigo color
        doc.text(`Document ${index + 1}: ${item.fileName}`, margin, yPosition);
        
        yPosition += 3;

        // Préparation des données Contact fusionnées pour le PDF
        const contactInfo = `${item.email}\n${item.telephone}`;

        // Table for this specific document
        autoTable(doc, {
            startY: yPosition,
            head: [['Information', 'Détails']],
            body: [
                ['Nom et Prénom', item.nomComplet],
                ['Contact', contactInfo], // Fusion Email et Téléphone
                ['Sujet', item.sujet],
                ['Objectif général et spécifiques', item.objectifs]
            ],
            theme: 'grid',
            styles: {
                font: 'times', // Force Times New Roman inside table
                fontSize: 10,
                cellPadding: 5,
                lineColor: [226, 232, 240],
                lineWidth: 0.1,
                overflow: 'linebreak'
            },
            headStyles: { 
                fillColor: [241, 245, 249], // slate-100
                textColor: [71, 85, 105], // slate-600
                fontStyle: 'bold',
                lineColor: [203, 213, 225],
                lineWidth: 0.1
            },
            columnStyles: {
                0: { cellWidth: 60, fontStyle: 'bold', textColor: [51, 65, 85] },
                1: { cellWidth: 'auto' }
            },
            margin: { left: margin, right: margin }
        });

        // @ts-ignore
        yPosition = doc.lastAutoTable.finalY + 15;
    });

    doc.save("extraction-donnees.pdf");
  };

  return (
    <div className="w-full animate-fadeIn font-times">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors font-bold"
        >
          <ArrowLeft size={16} className="mr-1" />
          Retour
        </button>
        
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-green-600 text-sm font-bold px-3 py-1 bg-green-50 rounded-full">
            <CheckCircle size={14} className="mr-1.5" />
            Analyse Terminée
          </span>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-bold"
          >
            <FileDown size={18} className="mr-2" />
            Télécharger le Rapport PDF
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-center mb-8">
            {/* H2 will be Montserrat Extra Bold via CSS */}
            <h2 className="text-2xl text-slate-900">Données Extraites</h2>
            <p className="text-slate-500">Voici les informations structurées récupérées de vos documents.</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {result.analyses.map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              {/* Card Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center">
                <div className="p-2 bg-white border border-slate-200 rounded-lg mr-3 text-indigo-600">
                   <FileText size={20} />
                </div>
                {/* H3 will be Montserrat Extra Bold via CSS */}
                <h3 className="text-lg text-slate-800">{item.fileName}</h3>
              </div>

              {/* Card Body - The Table */}
              <div className="p-0">
                <table className="min-w-full divide-y divide-slate-100">
                  <tbody className="bg-white divide-y divide-slate-100">
                    <tr className="group hover:bg-slate-50">
                      <td className="px-6 py-4 w-1/4 whitespace-nowrap text-sm font-bold text-slate-500">Nom et Prénom</td>
                      <td className="px-6 py-4 w-3/4 text-sm text-slate-900">{item.nomComplet}</td>
                    </tr>
                    <tr className="group hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-500">Contact</td>
                        <td className="px-6 py-4 text-sm text-slate-900">
                            <div className="flex flex-col space-y-1">
                                {item.email && item.email !== "Non mentionné" && (
                                    <span className="text-indigo-600 font-medium">{item.email}</span>
                                )}
                                <span className="text-slate-700">{item.telephone}</span>
                            </div>
                        </td>
                    </tr>
                    <tr className="group hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-500">Sujet</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{item.sujet}</td>
                    </tr>
                    <tr className="group hover:bg-slate-50 bg-slate-50/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-500 align-top">Objectif général et spécifiques</td>
                        <td className="px-6 py-4 text-sm text-slate-700 whitespace-pre-line leading-relaxed">{item.objectifs}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Preview;
