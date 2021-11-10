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
      { path: 'lib' },
      viewer.current
    ).then(async (instance) => {
      setInstance(instance);
      const { FitMode, docViewer } = instance;
      instance.setFitMode(FitMode.FitWidth);
      // disable some incompatible tools
      instance.disableElements([
        'highlightToolGroupButton',
        'underlineToolGroupButton',
        'strikeoutToolGroupButton',
        'squigglyToolGroupButton',
        'viewControlsButton',
        'downloadButton',
        'printButton',
        'fileAttachmentToolGroupButton',
        'toolbarGroup-Edit',
      ]);
      // Extends WebViewer to allow loading HTML5 files from URL or static folder.
      const htmlModule = await initializeHTMLViewer(instance);

      docViewer.on('documentLoaded', () => {
        setTimeout(() => {
          if (instance.getFitMode() !== FitMode.FitWidth) {
            instance.setFitMode(FitMode.FitWidth);
          }
        }, 1500);
      });

      setHTMLModule(htmlModule);

      loadURL(`https://www.pdftron.com/`);
    });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (HTMLModule && Object.keys(res).length > 0) {
      const { url, width, height, thumb, origUrl } = res;
      HTMLModule.loadHTMLPage({ url, width, height, thumb, origUrl });
    }
  }, [HTMLModule, res]);

  return <div ref={viewer} className="HTMLViewer"></div>;
};

export default Viewer;
