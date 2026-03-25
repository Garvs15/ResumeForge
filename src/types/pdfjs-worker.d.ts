declare module 'pdfjs-dist/legacy/build/pdf.worker.entry' {
  const workerSrc: string;
  export default workerSrc;
}

declare module 'pdfjs-dist/legacy/build/pdf' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjs: any;
  export = pdfjs;
}