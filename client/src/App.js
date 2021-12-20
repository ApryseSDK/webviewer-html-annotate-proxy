import React, { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';
import { initializeHTMLViewer } from '@pdftron/webviewer-html';
import './App.css';
import {
  Heading,
  InputGroup,
  InputLeftAddon,
  Input,
  Button,
  Text,
  FormLabel,
  FormControl,
  Spinner,
} from '@chakra-ui/react';


const App = () => {
  const viewer = useRef(null);
  const [instance, setInstance] = useState(null);
  const [HTMLModule, setHTMLModule] = useState(null);
  const [response, setResponse] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [size, setSize] = useState({});

  const SERVER_ROOT = '0.0.0.0';
  const PORT = 3100;
  const PATH = `http://${SERVER_ROOT}:${PORT}`;

  const isValidURL = (url) => {
    // eslint-disable-next-line no-useless-escape
    return /(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi.test(url);
  }

  useEffect(() => {
    WebViewer(
      { path: 'lib' },
      viewer.current
    ).then(async (instance) => {
      const { FitMode, docViewer } = instance;
      instance.setFitMode(FitMode.FitWidth);
      // disable some incompatible tools
      instance.disableElements([
        'viewControlsButton',
        'downloadButton',
        'printButton',
        'fileAttachmentToolGroupButton',
        'toolbarGroup-Edit',
      ]);

      setInstance(instance);

      // Extends WebViewer to allow loading HTML5 files from URL or static folder.
      const htmlModule = await initializeHTMLViewer(instance);

      // needs to reset FitMode on subsequent loads
      docViewer.on('documentLoaded', () => {
        if (instance.getFitMode() !== FitMode.FitWidth) {
          instance.setFitMode(FitMode.FitWidth);
        }
      });

      setHTMLModule(htmlModule);

      loadURL(`https://www.pdftron.com/`);
    });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (HTMLModule && Object.keys(response).length > 0) {
      const { url, textLayer, width, height, thumb, origUrl } = response;
      HTMLModule.loadHTMLPage({ url, textLayer, width, height, thumb, origUrl });
    }
  }, [HTMLModule, response]);

  const loadURL = async (url) => {
    setLoading(true);
    setError('');

    // first fetch for the proxied url
    await fetch(`${PATH}/pdftron-proxy?url=${url}`)
      .then(async (res) => {
        var size = { width: 1800, height: 7000 };
        if (res.status === 999) {
          res.json().then(j => setError(j.data));
        } else {
          try {
            size = JSON.parse(res.statusText);
          } catch (e) {
            console.log('Error in fetching size')
          }
          setSize(size);

          // second fetch for the text layer data
          await fetch(`${PATH}/pdftron-text-data`)
            .then(async (res) => res.json())
            .then(selectionData => {
              setResponse({
                url: `${PATH}`,
                textLayer: selectionData,
                thumb: '',
                ...size,
                origUrl: `${PATH}`,
              });
            })
            .catch(err => {
              setResponse({
                url: `${PATH}`,
                textLayer: {},
                thumb: '',
                ...size,
                origUrl: `${PATH}`,
              });
              console.log(err);
              setError(`Can't retrieve text layer`);
            });
        }
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
        setError('Trouble fetching the URL, please make sure the server is running. `cd server && npm start`');
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
              setError('Trouble downloading, please refresh and start again.');
            }
          } else {
            setError('Trouble downloading, check server log.');
          }
          setLoading(false);
        }).catch(err => {
          console.log(err);
          setError('Trouble downloading, please make sure the server is running. `cd server && npm start`');
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
    if (instance)
      instance.UI.setToolbarGroup('toolbarGroup-View');
  }

  return (
    <div className="App">
      <div className="Nav">
        <Heading size="md">WebViewer HTML</Heading>
        <Text py={5}>
          In this demo, you can pass any URL. The URL passed in will be proxied
          and you will be able to annotate directly here.
        </Text>
        <FormControl id="domain" my={3}>
          <FormLabel>URL of the page</FormLabel>
          <InputGroup
            onChange={(e) => {
              setError('');
              setUrl(e.target.value);
            }}
          >
            <InputLeftAddon children="https://" />
            <Input placeholder="mysite" />
          </InputGroup>
        </FormControl>
        <FormControl>
          <Button
            my={3}
            disabled={loading}
            onClick={() => {
              if (!!url && isValidURL(url)) {
                loadURL(`https://${url}`);
              } else {
                setError('Please enter a valid URL and try again.');
              }
            }}
          >
            {loading && <Spinner mx={1} label="Loading website" />}Load the website
          </Button>
          <Button my={3} onClick={() => browseMode()} disabled={loading}>
            {loading && <Spinner mx={1} label="Loading website" />}Browse the website
          </Button>
          <Button my={3} onClick={() => downloadPDF()} disabled={loading}>
            {loading && <Spinner mx={1} label="Loading website" />}Download annotated PDF
          </Button>
        </FormControl>

        {error ? <Text color="red">{error}</Text> : null}
      </div>
      <div ref={viewer} className="HTMLViewer"></div>
    </div>
  );
}

export default App;
