import { useState, useCallback, useRef } from 'react';
import { MOCK_DOCUMENTS, DOCUMENT_TYPES_LIST, generateExtractedSections } from '../data/docIntelligenceData';

const uid = () => Math.random().toString(36).slice(2, 9).toUpperCase();

const CLASSIFY_TYPES = DOCUMENT_TYPES_LIST.filter(t => t !== 'Unclassified');

function guessType(fileName) {
  const f = fileName.toLowerCase();
  if (f.includes('w2') || f.includes('w-2'))           return 'W-2 Wage Statement';
  if (f.includes('1040') || f.includes('tax'))         return 'Federal Tax Return (1040)';
  if (f.includes('bank') || f.includes('stmt'))        return 'Bank Statement';
  if (f.includes('pay') || f.includes('stub'))         return 'Pay Stub';
  if (f.includes('employ') || f.includes('letter'))   return 'Employment Verification Letter';
  if (f.includes('apprais'))                           return 'Property Appraisal Report';
  if (f.includes('credit'))                            return 'Credit Report';
  if (f.includes('title'))                             return 'Title Search Report';
  if (f.includes('1003') || f.includes('application')) return '1003 Loan Application';
  // Random fallback for realistic demo
  return CLASSIFY_TYPES[Math.floor(Math.random() * CLASSIFY_TYPES.length)];
}

export function useDocPipeline() {
  const [documents, setDocuments] = useState(MOCK_DOCUMENTS);
  const timers = useRef({});

  const update = useCallback((id, patch) =>
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d)),
    []
  );

  const uploadDocument = useCallback((file, loanId, borrowerName = 'Unknown Borrower') => {
    const id = `doc-up-${uid()}`;

    const shell = {
      id, loanId, borrowerName,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      totalPages: 1,
      classifiedType: null,
      confidence: null,
      isUnclassified: false,
      pipelineStatus: 'classifying',  // classifying | extracting | complete | failed
      sections: [],
    };

    setDocuments(prev => [shell, ...prev]);

    // Stage 1 — Classification (~1.8s)
    timers.current[`${id}-c`] = setTimeout(() => {
      const classifiedType = guessType(file.name);
      const confidence     = 0.55 + Math.random() * 0.44;
      const isUnclassified = confidence < 0.60;

      update(id, {
        classifiedType: isUnclassified ? 'Unclassified' : classifiedType,
        confidence,
        isUnclassified,
        pipelineStatus: 'extracting',
      });

      // Stage 2 — Extraction (~2.8s)
      timers.current[`${id}-e`] = setTimeout(() => {
        const sections = generateExtractedSections(id, classifiedType, borrowerName);
        update(id, { pipelineStatus: 'complete', sections, totalPages: sections.some(s => s.fields.some(f => f.page > 0)) ? 2 : 1 });
      }, 2800 + Math.random() * 600);
    }, 1800 + Math.random() * 500);

    return id;
  }, [update]);

  const overrideClassification = useCallback((id, newType) => {
    update(id, {
      classifiedType: newType,
      isUnclassified: newType === 'Unclassified',
      confidence: newType === 'Unclassified' ? 0.30 : 0.82,
    });
  }, [update]);

  const updateFieldValue = useCallback((docId, fieldId, value) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;
      return {
        ...doc,
        sections: doc.sections.map(sec => ({
          ...sec,
          fields: sec.fields.map(f => f.id === fieldId ? { ...f, editedValue: value, edited: true } : f),
        })),
      };
    }));
  }, []);

  const saveDocument = useCallback((docId) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;
      return {
        ...doc,
        savedAt: new Date().toISOString(),
        sections: doc.sections.map(sec => ({
          ...sec,
          fields: sec.fields.map(f => f.edited ? { ...f, value: f.editedValue ?? f.value, editedValue: undefined, edited: false } : f),
        })),
      };
    }));
  }, []);

  return { documents, uploadDocument, overrideClassification, updateFieldValue, saveDocument };
}
