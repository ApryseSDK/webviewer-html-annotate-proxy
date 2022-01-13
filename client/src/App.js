import Viewer from './components/viewer/Viewer';
import Nav from './components/navigation/Nav';
import React, { useState } from 'react';
import './App.css';
import WebViewerContext from './context/webviewer';


function App() {
  const [response, setResponse] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [instance, setInstance] = useState();
  const [pageDimensions, setPageDimensions] = useState({ width: 1800, height: 7000 });

  const SERVER_ROOT = '0.0.0.0';
  const PORT = 3100;
  const PATH = `http://${SERVER_ROOT}:${PORT}`;

  const loadURL = async (url) => {
    setLoading(true);
    setFetchError('');

    try {
      // first fetch for the proxied url
      const proxyUrlRes = await fetch(`${PATH}/pdftron-proxy?url=${url}`);
      if (proxyUrlRes.status === 999) {
        proxyUrlRes.json().then(e => setFetchError(e.data));
      } else {
        let actualPageDimensions = pageDimensions;
        try {
          actualPageDimensions = JSON.parse(proxyUrlRes.headers.get('dimensions'));
          setPageDimensions(actualPageDimensions);
        } catch (e) {
          console.error('Error in fetching page dimensions');
        }

        try {
          // second fetch for the text layer data
          const textDataRes = await fetch(`${PATH}/pdftron-text-data`);
          const selectionData = await textDataRes.json();
          setResponse({
            url: `${PATH}`,
            textLayer: selectionData,
            thumb: '',
            ...actualPageDimensions,
            origUrl: `${PATH}`,
          });          
        } catch (error) {
          setResponse({
            url: `${PATH}`,
            textLayer: {},
            thumb: '',
            ...actualPageDimensions,
            origUrl: `${PATH}`,
          });
          console.error(error);
          setFetchError(`Can't retrieve text layer`);
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      setFetchError('Trouble fetching the URL, please make sure the server is running. `cd server && npm start`');      
    }
  };

  const downloadPDF = async () => {
    if (response.url) {
      setLoading(true);
      try {
        const downloadPdfRes = await fetch(`${PATH}/pdftron-download`);
        if (downloadPdfRes.ok) {
          try {
            await loadDocAndAnnots(downloadPdfRes);
          } catch (error) {
            console.error(error);
            setFetchError('Trouble downloading, please refresh and start again.');
          }
        } else {
          setFetchError('Trouble downloading, check server log.');
        }
        setLoading(false);
      }
      catch (error) {
        console.error(error);
        setFetchError('Trouble downloading, please make sure the server is running. `cd server && npm start`');
        setLoading(false);
      }
    }
  };

  const loadDocAndAnnots = async (buffer) => {
    setLoading(true);
    const doc = await instance.Core.createDocument(buffer, {
      extension: 'png',
      pageSizes: [pageDimensions],
    });

    const xfdf = await instance.docViewer
      .getAnnotationManager()
      .exportAnnotations();
    const data = await doc.getFileData({ xfdfString: xfdf });
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotated';
    a.click();
    a.remove();
    setLoading(false);
    // in case the Blob uses a lot of memory
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const browseMode = () => {
    instance && instance.UI.setToolbarGroup('toolbarGroup-View');
  }

  return (
    <WebViewerContext.Provider value={{ instance, setInstance }}>
      <div className="App">
        <Nav
          handleSubmit={loadURL}
          fetchError={fetchError}
          showSpinner={loading}
          handleDownload={downloadPDF}
          browseMode={browseMode}
        />
        <Viewer res={response} loadURL={loadURL} />
      </div>
    </WebViewerContext.Provider>
  );
}

export default App;
