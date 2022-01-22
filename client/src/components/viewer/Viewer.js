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
      { path: '/lib' },
      viewer.current
    ).then(async (instance) => {
      setInstance(instance);
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
      // Extends WebViewer to allow loading HTML5 files from URL or static folder.
      const htmlModule = await initializeHTMLViewer(instance);

      // needs to reset FitMode on subsequent loads
      docViewer.on('documentLoaded', () => {
        if (instance.getFitMode() !== FitMode.FitWidth) {
          instance.setFitMode(FitMode.FitWidth);
        }
      });

      setHTMLModule(htmlModule);

      // loadURL(`https://www.pdftron.com/`);
      // loadURL(`https://www.youtube.com/`);
      loadURL(`https://www.mdlottery.com/about-us/legal-information/#disclaimer`);
      // loadURL(`https://www.valottery.com/aboutus/faq`);
      // loadURL(`https://www.mdlottery.com/`);
      // loadURL(`https://www.pdftron.com/documentation/web/get-started/npm/`);
    });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (HTMLModule && Object.keys(res).length > 0) {
      const { url, textLayer, width, height, thumb, origUrl } = res;
      HTMLModule.loadHTMLPage({ url, textLayer, width, height, thumb, origUrl });
    }
  }, [HTMLModule, res]);

  return <div ref={viewer} className="HTMLViewer"></div>;
};

export default Viewer;
