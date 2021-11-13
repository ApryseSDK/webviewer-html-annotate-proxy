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
  const [size, setSize] = useState({});

  const SERVER_ROOT = '0.0.0.0';
  const PORT = 3100;
  const PATH = `http://${SERVER_ROOT}:${PORT}`;

  const loadURL = (url) => {
    setLoading(true);
    setFetchError('');
    fetch(`${PATH}/pdftron-proxy?url=${url}`)
      .then(async (res) => {
        var size = { width: 1800, height: 7000 };
        if (res.status === 999) {
          res.json().then(j => setFetchError(j.data));
        } else {
          try {
            size = JSON.parse(res.statusText);
            setSize(size);
          } catch (e) {
          }
          setResponse({
            url: `${PATH}`,
            thumb: '',
            ...size,
            origUrl: `${PATH}`,
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
        setFetchError('Trouble fetching the URL, please make sure the server is running. `cd server && npm start`');
      });
  };

  const downloadPDF = () => {
    if (response.url) {
      setLoading(true);
      fetch(`${PATH}/pdftron-download`)
        .then(async (res) => {
          console.log(res);
          if (res.ok) {
            try {
              await loadDocAndAnnots(res);
            } catch (err) {
              console.log(err);
              setFetchError('Trouble downloading, please refresh and start again.');
            }
          } else {
            setFetchError('Trouble downloading, check server log.');
          }
          setLoading(false);
        }).catch(err => {
          console.log(err);
          setFetchError('Trouble downloading, please make sure the server is running. `cd server && npm start`');
          setLoading(false);
        });
    }
  };

  const loadDocAndAnnots = async (buffer) => {
    setLoading(true);
    console.log('start create doc to download')
    const doc = await instance.Core.createDocument(buffer, {
      extension: 'png',
      pageSizes: [size],
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
