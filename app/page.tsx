"use client";

import { MutableRefObject, useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import { PDFPageProxy } from "pdfjs-dist/types/src/display/api";
//import workerSrc from 'pdfjs-dist/build/pdf.worker.entry';

GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";

///pdf.worker.min.js
const Home = () => {
  const [pdfPages, setPdfPages] = useState<PDFPageProxy[]>([]);
  const [currentPage, setCurrentPage] = useState<PDFPageProxy>();
  const hasFetched = useRef(false);
  const signedAll = useRef(false);
  const [inputValue, setInputValue] = useState("");

  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    const fetchAndRenderPDF = async () => {
      const response = await fetch("/api/create-pdf");
      const pdfData = await response.arrayBuffer();

      const pdfUint8Array = new Uint8Array(pdfData);

      const loadingTask = getDocument({ data: pdfUint8Array });
      const pdf = await loadingTask.promise;

      const pages = await Promise.all(
        Array.from({ length: pdf.numPages }, (_, index) =>
          pdf.getPage(index + 1)
        )
      );
      setPdfPages(pages);
      setCurrentPage(pages[0]);
    };

    fetchAndRenderPDF();
  }, []);

  const handleSign = async () => {
    if(signedAll.current) {
      await saveSignatureData();
      return;
      /*
       PDF'in imzalandığı bilgiyi ve 
text box içindeki bilgiyi backend'e kayıt için gönderin.

7- Backend:
Alınan imzalanmış PDF ve text box bilgilerini kaydedin.

8- Frontend:
PDF'in başarıyla kaydedildiği bilgisi alındığında, "İmzalı PDF'i Göster" 
butonunu render edin.

9- Frontend:
"İmzalı PDF'i Göster" butonuna basıldığında, imzalanmış PDF'i tekrar render edin.

       */
    }
    setCurrentPageIndex((curr) => (curr + 1) % pdfPages.length);
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const saveSignatureData = async () => {
    const response = await fetch("/api/save-signature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputValue }),
    });

    if (response.ok) {
      alert("Data saved successfully!");
    } else {
      alert("Failed to save data.");
    }
  };

  useEffect(() => {
    hasFetched.current = false;
    setCurrentPage(pdfPages[currentPageIndex]);
  }, [currentPageIndex]);

  return (
    <div>
      {pdfPages.length > 0 && currentPage && (
        <PDFPage
          page={currentPage}
          onSign={handleSign}
          hasFetched={hasFetched}
          signedAll={signedAll}
          pageIndex={currentPageIndex}
          inputValue={inputValue}
          onInputChange={handleInputChange}
        />
      )}
    </div>
    // <div>
    //   {pdfPages.map((page, index) => (
    //     <PDFPage key={index} page={page} pageIndex={index} />
    //   ))}
    // </div>
  );
};

/*
({
  page,
  pageIndex,
}: {
  page: PDFPageProxy;
  pageIndex: number;
})
*/
const PDFPage = ({
  page,
  onSign,
  hasFetched,
  signedAll,
  pageIndex,
  inputValue,
  onInputChange,
}: {
  page: PDFPageProxy;
  onSign: () => void;
  hasFetched: MutableRefObject<boolean>;
  signedAll: MutableRefObject<boolean>;
  pageIndex: number;
  inputValue: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context!,
        viewport: viewport,
      };
      page.render(renderContext);
    }
  }, [page]);

  const handleSign = () => {
    if (pageIndex === 2) {
      signedAll.current = true;
    }
    onSign();
  };

  return (
    <div
      style={{
        position: "relative",
        marginBottom: "20px",
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "5px",
      }}
    >
      <canvas ref={canvasRef}></canvas>
      {pageIndex === 1 && (
        <input
          type="text"
          value={inputValue}
          onChange={onInputChange}
          placeholder="Enter your information"
          style={{
            position: "absolute",
            top: "500px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "20px 40px",
            borderRadius: "5px",
            border: "1px solid #000",
          }}
        />
      )}
      <button
        style={{
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "5px 10px",
          backgroundColor: "blue",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={handleSign}
      >
        İmzala
      </button>
    </div>
  );
};

export default Home;
