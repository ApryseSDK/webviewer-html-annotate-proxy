import WebViewer from '@pdftron/webviewer';
import { initializeHTMLViewer } from '@pdftron/webviewer-html';
import React, { useContext, useEffect, useRef, useState } from 'react';
import WebViewerContext from '../../context/webviewer';
import './Viewer.css';

const Viewer = ({ res, loadURL }) => {
  const viewer = useRef(null);
  const beenInitialised = useRef(false);
  const [HTMLModule, setHTMLModule] = useState(null);
  const { setInstance } = useContext(WebViewerContext);

  useEffect(() => {
    if (!beenInitialised.current) {
      beenInitialised.current = true;
      WebViewer.Iframe(
        {
          path: '/lib',
          disableVirtualDisplayMode: true,
        },
        viewer.current
      ).then(async (instance) => {
        setInstance(instance);

        const license = `---- Insert commercial license key here after purchase ----`;

        // Extends WebViewer to allow loading HTML5 files from URL or static folder.
        const htmlModule = await initializeHTMLViewer(instance, { license });

        setHTMLModule(htmlModule);

        loadURL(`https://docs.apryse.com/documentation/web/guides/html/load-html/`);

        /* How to proxy with custom HTTP headers */
        // loadURL(`https://www.pdftron.com/`, {
        //   customheaders: JSON.stringify({
        //     Authorization: 'token',
        //     'custom-header': 'custom token',
        //   }),
        //   // invalid values: {}, { key: value }, "random string that can't be parsed"
        // });
      });
    }
  }, [loadURL, setInstance]);

  useEffect(() => {
    if (HTMLModule && Object.keys(res).length > 0) {
      const { iframeUrl, width, height, urlToProxy } = res;
      HTMLModule.loadHTMLPage({ iframeUrl, width, height, urlToProxy });
    }
  }, [HTMLModule, res]);

  return <div ref={viewer} className="HTMLViewer"></div>;
};

export default Viewer;
