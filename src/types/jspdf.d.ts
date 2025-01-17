import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      head: string[][];
      body: string[][];
      startY?: number;
      margin?: number;
      theme?: string;
      styles?: any;
      headStyles?: any;
      bodyStyles?: any;
    }) => void;
  }
}
