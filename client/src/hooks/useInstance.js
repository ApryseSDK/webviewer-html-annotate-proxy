import WebViewerContext from '../context/webviewer'
import { useContext } from 'react';

export default function useInstance() {
  const { instance } = useContext(WebViewerContext);
  return instance;
}