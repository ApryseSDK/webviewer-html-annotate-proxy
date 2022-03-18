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
  const defaultPageDimensions = { width: 1440, height: 770 };
  const [pageDimensionsForDownload, setPageDimensionsForDownload] = useState(defaultPageDimensions);
  const [validUrl, setValidUrl] = useState('');

  const SERVER_ROOT = 'localhost';
  const PORT = 3100;
  const PATH = `http://${SERVER_ROOT}:${PORT}`;

  const loadURL = async (url) => {
    setLoading(true);
    setFetchError('');

    try {
      // first fetch for the proxied url
      const proxyUrlRes = await fetch(`${PATH}/pdftron-proxy?url=${url}`, { credentials: 'include' });
      setValidUrl(url);
      if (proxyUrlRes.status === 400) {
        setFetchError((await proxyUrlRes.json()).errorMessage);
        setLoading(false);
      } else {
        const proxyUrlResJson = await proxyUrlRes.json();
        let validUrl = url;
        try {
          // retrieve validUrl from response
          validUrl = proxyUrlResJson.validUrl;
          setValidUrl(validUrl);
          // retrieve pageDimensions from response (use for downloading)
          setPageDimensionsForDownload(proxyUrlResJson.pageDimensions);
        } catch {
          console.error('Error in calling `/pdftron-proxy`. Check server log');
        }
        const { pathname } = new URL(validUrl);

        // send back defaultPageDimensions so iframeHeight can be updated dynamically from script injection
        setResponse({
          url: `${PATH}${pathname}`,
          thumb: '',
          ...defaultPageDimensions,
          origUrl: validUrl,
        });
        setLoading(false);
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
      setFetchError('');
      try {
        const downloadPdfRes = await fetch(`${PATH}/pdftron-download?url=${validUrl}`);
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
      pageSizes: [pageDimensionsForDownload],
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