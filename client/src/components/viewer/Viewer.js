import WebViewer from '@pdftron/webviewer';
import { initializeHTMLViewer } from '@pdftron/webviewer-html';
import React, { useContext, useEffect, useRef, useState } from 'react';
import WebViewerContext from '../../context/webviewer';
import './Viewer.css';

const Viewer = ({ res, loadURL }) => {
  const viewer = useRef(null);
  const [HTMLModule, setHTMLModule] = useState(null);
  const { setInstance } = useContext(WebViewerContext);

  useEffect(() => {
    WebViewer(
      {
        path: '/lib',
        disableVirtualDisplayMode: true,
      },
      viewer.current
    ).then(async (instance) => {
      setInstance(instance);
      const { FitMode, docViewer } = instance;
      instance.setFitMode(FitMode.FitWidth);

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
    if (HTMLModule && Object.keys(res).length > 0) {
      const { iframeUrl, width, height, urlToProxy } = res;
      const license = `---- Insert commercial license key here after purchase ----`;
      HTMLModule.loadHTMLPage({ iframeUrl, width, height, urlToProxy, license });
    }
  }, [HTMLModule, res]);

  return <div ref={viewer} className="HTMLViewer"></div>;
};

export default Viewer;
